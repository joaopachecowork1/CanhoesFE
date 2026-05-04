"use client";

import { useState } from "react";
import { toast } from "sonner";
import type {
  AdminModuleKey,
  EventAdminStateDto,
  EventPhaseDto,
} from "@/lib/api/types";

import type { ModuleVisibilityItem } from "@/hooks/useModuleVisibility";
import { useModuleVisibility } from "@/hooks/useModuleVisibility";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { getPhaseLabel } from "@/lib/canhoesEvent";

import { AdminStateMessage } from "./AdminStateMessage";
import {
  ADVANCED_ADMIN_MODULE_ORDER,
  QUICK_ADMIN_MODULE_ORDER,
} from "../adminContentSections";
import { AdminSettingsMainPanel, AdminSettingsAdvancedSheet } from "./AdminControlCenterPanels";

export const PHASE_LABELS: Record<EventPhaseDto["type"], string> = {
  PROPOSALS: "Nomeações",
  VOTING: "Votação",
  RESULTS: "Resultados",
  DRAW: "Sorteio",
};

export const PHASE_OPTIONS = Object.keys(PHASE_LABELS) as EventPhaseDto["type"][];

export function selectModuleItems(
  order: readonly AdminModuleKey[],
  itemsByKey: Partial<Record<AdminModuleKey, ModuleVisibilityItem>>
) {
  return order.map((key) => itemsByKey[key]).filter((item): item is ModuleVisibilityItem => Boolean(item));
}

function buildModuleItemsByKey(moduleItems: ModuleVisibilityItem[]) {
  return Object.fromEntries(moduleItems.map((item) => [item.key, item])) as Partial<
    Record<AdminModuleKey, ModuleVisibilityItem>
  >;
}

export type SettingsFeedbackState = {
  message: string;
  tone: "default" | "error" | "success";
};

type AdminControlCenterProps = {
  activeEventName: string | null;
  eventId: string | null;
  events: Array<{ id: string; name: string }>;
  loading: boolean;
  onRefresh: () => Promise<void>;
  state: EventAdminStateDto | null;
};

export function AdminControlCenter({
  activeEventName,
  eventId,
  events,
  loading,
  onRefresh,
  state,
}: Readonly<AdminControlCenterProps>) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [feedback, setFeedback] = useState<SettingsFeedbackState | null>(null);

  const {
    allDisabled,
    allEnabled,
    moduleItems,
    savingKey: visibilitySavingKey,
    setAllModules,
    setNominationsVisible,
    setResultsVisible,
    toggleModule,
    visibleCount,
  } = useModuleVisibility({ eventId, onUpdate: onRefresh, state });

  const runVisibilityAction = async (
    messages: { saving: string; success: string; error: string },
    action: () => Promise<boolean>
  ) => {
    setFeedback({ message: messages.saving, tone: "default" });
    const ok = await action();
    setFeedback({
      message: ok ? messages.success : messages.error,
      tone: ok ? "success" : "error",
    });
    return ok;
  };

  const handleUpdatePhase = async (phaseType: EventPhaseDto["type"]) => {
    if (!eventId || phaseType === state?.activePhase?.type) return;

    setFeedback({ message: "A guardar fase...", tone: "default" });
    try {
      await canhoesEventsRepo.updateAdminPhase(eventId, { phaseType });
      await onRefresh();
      toast.success("Fase do evento atualizada");
      setFeedback({
        message: `Fase atualizada para ${PHASE_LABELS[phaseType]}.`,
        tone: "success",
      });
    } catch (error) {
      logFrontendError("AdminControlCenter.updatePhase", error, { phaseType });
      toast.error(getErrorMessage(error, "Não foi possível mudar a fase."));
      setFeedback({ message: "Falha ao guardar a fase atual.", tone: "error" });
    }
  };

  const handleActivateEvent = async (eventIdToActivate: string) => {
    if (!eventIdToActivate || eventIdToActivate === eventId) return;

    setFeedback({ message: "A mudar evento ativo...", tone: "default" });
    try {
      await canhoesEventsRepo.adminActivateEvent(eventIdToActivate);
      await onRefresh();
      toast.success("Evento ativo atualizado");
      const nextEventName =
        events.find((event) => event.id === eventIdToActivate)?.name ?? "evento";
      setFeedback({
        message: `Evento ativo atualizado para ${nextEventName}.`,
        tone: "success",
      });
    } catch (error) {
      logFrontendError("AdminControlCenter.activateEvent", error, { eventId: eventIdToActivate });
      toast.error(getErrorMessage(error, "Não foi possível mudar o evento ativo."));
      setFeedback({ message: "Falha ao atualizar o evento ativo.", tone: "error" });
    }
  };

  const handleModuleToggle = (item: ModuleVisibilityItem, checked: boolean) => {
    const labelLower = item.label.toLowerCase();
    runVisibilityAction(
      {
        saving: `A guardar ${labelLower}...`,
        success: `${item.label} atualizado.`,
        error: `Falha ao guardar ${labelLower}.`,
      },
      () => toggleModule(item.key, checked)
    );
  };

  const handleNominationsVisibility = (checked: boolean) => {
    runVisibilityAction(
      {
        saving: "A guardar exposição de nomeações...",
        success: checked ? "Nomeações abertas ao grupo." : "Nomeações ocultadas do grupo.",
        error: "Falha ao guardar a exposição de nomeações.",
      },
      () => setNominationsVisible(checked)
    );
  };

  const handleResultsVisibility = (checked: boolean) => {
    runVisibilityAction(
      {
        saving: "A guardar exposição de resultados...",
        success: checked ? "Resultados abertos ao grupo." : "Resultados ocultados do grupo.",
        error: "Falha ao guardar a exposição de resultados.",
      },
      () => setResultsVisible(checked)
    );
  };

  const handleSetAllModules = (visible: boolean) => {
    runVisibilityAction(
      {
        saving: visible ? "A ativar todos os módulos..." : "A desativar todos os módulos...",
        success: visible ? "Todos os módulos ficaram ativos." : "Todos os módulos ficaram ocultos.",
        error: visible ? "Falha ao ativar todos os módulos." : "Falha ao desativar todos os módulos.",
      },
      () => setAllModules(visible)
    );
  };

  const moduleItemsByKey = buildModuleItemsByKey(moduleItems);
  const quickModuleItems = selectModuleItems(QUICK_ADMIN_MODULE_ORDER, moduleItemsByKey);
  const advancedModuleItems = selectModuleItems(ADVANCED_ADMIN_MODULE_ORDER, moduleItemsByKey);

  if (!state) {
    return (
      <AdminStateMessage variant="panel">
        Falta uma edição ativa para abrir os controlos.
      </AdminStateMessage>
    );
  }

  const currentState = state;
  const activeEventLabel = activeEventName ?? "Sem edição ativa";
  const currentPhaseLabel = getPhaseLabel(currentState.activePhase?.type);
  const pendingCount = currentState.counts.pendingProposalCount ?? 0;

  return (
    <div className="space-y-3">
      <AdminSettingsMainPanel
        activeEventLabel={activeEventLabel}
        currentPhaseLabel={currentPhaseLabel}
        eventId={eventId}
        events={events}
        feedback={!advancedOpen ? feedback : null}
        loading={loading}
        moduleCount={moduleItems.length}
        onActivateEvent={(value) => handleActivateEvent(value)}
        onOpenAdvanced={() => setAdvancedOpen(true)}
        onToggleQuickModule={handleModuleToggle}
        onUpdatePhase={(phase) => handleUpdatePhase(phase)}
        pendingCount={pendingCount}
        phaseLabels={PHASE_LABELS}
        phaseOptions={PHASE_OPTIONS}
        quickModuleItems={quickModuleItems}
        savingKey={visibilitySavingKey}
        state={currentState}
        visibilitySavingKey={visibilitySavingKey}
        visibleCount={visibleCount}
      />

      <AdminSettingsAdvancedSheet
        advancedModuleItems={advancedModuleItems}
        allDisabled={allDisabled}
        allEnabled={allEnabled}
        feedback={feedback}
        onOpenChange={setAdvancedOpen}
        onSetAllModules={handleSetAllModules}
        onSetNominationsVisible={handleNominationsVisibility}
        onSetResultsVisible={handleResultsVisibility}
        onToggleAdvancedModule={handleModuleToggle}
        open={advancedOpen}
        state={currentState}
        visibilitySavingKey={visibilitySavingKey}
      />
    </div>
  );
}
