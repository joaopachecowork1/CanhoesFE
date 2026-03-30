"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  EventAdminModuleVisibilityDto,
  EventAdminStateDto,
} from "@/lib/api/types";
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

  const visibleCount = useMemo(
    () => countVisibleModules(state?.effectiveModules),
    [state?.effectiveModules]
  );

  const moduleItems = useMemo(
    () =>
      CANHOES_MEMBER_MODULES.map((moduleDefinition) => ({
        ...moduleDefinition,
        checked: state?.moduleVisibility[moduleDefinition.key] ?? false,
        effective: state?.effectiveModules[moduleDefinition.key] ?? false,
      })),
    [state]
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
        toast.success(successMessage);
      } catch {
        toast.error("Nao foi possivel guardar a configuracao");
      } finally {
        setSavingKey(null);
      }
    },
    [eventId, onUpdate, state]
  );

  const toggleModule = useCallback(
    async (key: keyof EventAdminModuleVisibilityDto, checked: boolean) => {
      if (!state) return;

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
      await persistState(
        checked ? "all-enabled" : "all-disabled",
        {
          moduleVisibility: buildModuleVisibilityState(checked),
        },
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
