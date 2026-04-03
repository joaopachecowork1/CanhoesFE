"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  EventAdminModuleVisibilityDto,
  EventAdminStateDto,
} from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import {
  CANHOES_MEMBER_MODULES,
  buildModuleVisibilityState,
  countVisibleModules,
} from "@/lib/modules";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

type UseModuleVisibilityOptions = {
  eventId: string | null;
  onUpdate: () => Promise<void>;
  state: EventAdminStateDto | null;
};

export type ModuleVisibilityItem = (typeof CANHOES_MEMBER_MODULES)[number] & {
  checked: boolean;
  effective: boolean;
};

export function useModuleVisibility({
  eventId,
  onUpdate,
  state,
}: Readonly<UseModuleVisibilityOptions>) {
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [optimisticOverrides, setOptimisticOverrides] = useState<
    Partial<EventAdminModuleVisibilityDto>
  >({});

  const visibleCount = useMemo(
    () => countVisibleModules(state?.effectiveModules),
    [state?.effectiveModules]
  );

  const moduleItems = useMemo(
    () =>
      CANHOES_MEMBER_MODULES.map((moduleDefinition) => {
        const key = moduleDefinition.key;
        const serverChecked = state?.moduleVisibility[key] ?? false;
        const checked = key in optimisticOverrides ? optimisticOverrides[key]! : serverChecked;
        return {
          ...moduleDefinition,
          checked,
          effective: state?.effectiveModules[key] ?? false,
        };
      }),
    [state, optimisticOverrides]
  );

  const clearModuleOverrides = useCallback(
    (visibility: EventAdminModuleVisibilityDto) => {
      setOptimisticOverrides((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(visibility)) {
          delete next[key as keyof EventAdminModuleVisibilityDto];
        }
        return next;
      });
    },
    []
  );

  const persistState = useCallback(
    async (
      busyStateKey: string,
      patch: {
        moduleVisibility?: EventAdminModuleVisibilityDto;
        nominationsVisible?: boolean;
        resultsVisible?: boolean;
      },
      successMessage = "Visibilidade dos modulos atualizada"
    ) => {
      if (!eventId || !state) return;

      setSavingKey(busyStateKey);
      try {
        await canhoesEventsRepo.updateAdminState(eventId, patch);
        await onUpdate();
        if (patch.moduleVisibility) clearModuleOverrides(patch.moduleVisibility);
        toast.success(successMessage);
      } catch (err) {
        logFrontendError("Admin.useModuleVisibility", err, {
          endpoint: `admin/state (${busyStateKey})`,
        });
        if (patch.moduleVisibility) clearModuleOverrides(patch.moduleVisibility);
        toast.error(
          getErrorMessage(err, "Nao foi possivel guardar a configuracao dos modulos.")
        );
      } finally {
        setSavingKey(null);
      }
    },
    [eventId, onUpdate, state, clearModuleOverrides]
  );

  const toggleModule = useCallback(
    async (key: keyof EventAdminModuleVisibilityDto, checked: boolean) => {
      if (!state) return;

      setOptimisticOverrides((prev) => ({ ...prev, [key]: checked }));

      await persistState(
        key,
        {
          moduleVisibility: {
            ...state.moduleVisibility,
            [key]: checked,
          },
        },
        checked ? "Modulo aberto para membros" : "Modulo ocultado para membros"
      );
    },
    [persistState, state]
  );

  const setAllModules = useCallback(
    async (checked: boolean) => {
      const allOverrides = buildModuleVisibilityState(checked);
      setOptimisticOverrides(allOverrides);

      await persistState(
        checked ? "all-enabled" : "all-disabled",
        { moduleVisibility: allOverrides },
        checked
          ? "Todos os modulos ficaram disponiveis"
          : "Todos os modulos ficaram ocultos"
      );
    },
    [persistState]
  );

  return {
    allDisabled: moduleItems.every((item) => !item.checked),
    allEnabled: moduleItems.every((item) => item.checked),
    moduleItems,
    savingKey,
    setAllModules,
    setNominationsVisible: (checked: boolean) =>
      persistState(
        "nominations",
        { nominationsVisible: checked },
        checked ? "Nomeacoes abertas para membros" : "Nomeacoes ocultadas"
      ),
    setResultsVisible: (checked: boolean) =>
      persistState(
        "results",
        { resultsVisible: checked },
        checked ? "Resultados abertos para membros" : "Resultados ocultados"
      ),
    toggleModule,
    visibleCount,
  };
}
