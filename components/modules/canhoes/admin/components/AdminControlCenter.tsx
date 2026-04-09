"use client";

import { useState } from "react";
import { toast } from "sonner";

import type {
  AdminModuleKey,
  EventAdminSecretSantaStateDto,
  EventAdminStateDto,
  EventPhaseDto,
} from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { useModuleVisibility, type ModuleVisibilityItem } from "@/hooks/useModuleVisibility";

import { AdminStateMessage } from "./AdminStateMessage";
import {
  ADVANCED_MODULE_ORDER,
  formatPhaseLabel,
  PHASE_LABELS,
  PHASE_OPTIONS,
  QUICK_MODULE_ORDER,
  selectModuleItems,
} from "./adminSettingsConfig";
import {
  AdminSettingsAdvancedSheet,
  AdminSettingsMainPanel,
  type SettingsFeedbackState,
} from "./adminSettingsPanels";

type AdminControlCenterProps = {
  activeEventName: string | null;
  eventId: string | null;
  events: Array<{ id: string; name: string }>;
  loading: boolean;
  onRefresh: () => Promise<void>;
  secretSantaState: EventAdminSecretSantaStateDto | null;
  state: EventAdminStateDto | null;
};

function getModuleFeedback(label: string) {
  const labelLower = label.toLowerCase();
  return {
    saving: `A guardar ${labelLower}...`,
    success: `${label} atualizado.`,
    error: `Falha ao guardar ${labelLower}.`,
  };
}

export function AdminControlCenter({
  activeEventName,
  eventId,
  events,
  loading,
  onRefresh,
  secretSantaState,
  state,
}: Readonly<AdminControlCenterProps>) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [feedback, setFeedback] = useState<SettingsFeedbackState | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

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
  } = useModuleVisibility({
    eventId,
    onUpdate: onRefresh,
    state,
  });

  if (!state) {
    return <AdminStateMessage variant="panel">Falta uma edição ativa para abrir os controlos.</AdminStateMessage>;
  }

  const currentState = state;
  const moduleItemsByKey = Object.fromEntries(
    moduleItems.map((item) => [item.key, item])
  ) as Partial<Record<AdminModuleKey, ModuleVisibilityItem>>;

  const quickModuleItems = selectModuleItems(QUICK_MODULE_ORDER, moduleItemsByKey);
  const advancedModuleItems = selectModuleItems(ADVANCED_MODULE_ORDER, moduleItemsByKey);
  const activeEventLabel = activeEventName ?? "Sem edição ativa";
  const currentPhaseLabel = formatPhaseLabel(currentState.activePhase?.type);
  const pendingCount = currentState.counts.pendingProposalCount ?? 0;

  async function runVisibilityAction(
    savingMessage: string,
    successMessage: string,
    errorMessage: string,
    action: () => Promise<boolean>
  ) {
    setFeedback({ message: savingMessage, tone: "default" });
    const ok = await action();
    setFeedback({
      message: ok ? successMessage : errorMessage,
      tone: ok ? "success" : "error",
    });
    return ok;
  }

  async function handleUpdatePhase(phaseType: EventPhaseDto["type"]) {
    if (!eventId || phaseType === currentState.activePhase?.type) return;

    setSavingKey("phase");
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
      setFeedback({
        message: "Falha ao guardar a fase atual.",
        tone: "error",
      });
    } finally {
      setSavingKey(null);
    }
  }

  async function handleActivateEvent(eventIdToActivate: string) {
    if (!eventIdToActivate || eventIdToActivate === eventId) return;

    setSavingKey("event");
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
      logFrontendError("AdminControlCenter.activateEvent", error, {
        eventId: eventIdToActivate,
      });
      toast.error(getErrorMessage(error, "Não foi possível mudar o evento ativo."));
      setFeedback({
        message: "Falha ao atualizar o evento ativo.",
        tone: "error",
      });
    } finally {
      setSavingKey(null);
    }
  }

  function handleModuleToggle(item: ModuleVisibilityItem, checked: boolean) {
    const messages = getModuleFeedback(item.label);
    void runVisibilityAction(messages.saving, messages.success, messages.error, () =>
      toggleModule(item.key, checked)
    );
  }

  function handleNominationsVisibility(checked: boolean) {
    void runVisibilityAction(
      "A guardar exposição de nomeações...",
      checked ? "Nomeações abertas ao grupo." : "Nomeações ocultadas do grupo.",
      "Falha ao guardar a exposição de nomeações.",
      () => setNominationsVisible(checked)
    );
  }

  function handleResultsVisibility(checked: boolean) {
    void runVisibilityAction(
      "A guardar exposição de resultados...",
      checked ? "Resultados abertos ao grupo." : "Resultados ocultados do grupo.",
      "Falha ao guardar a exposição de resultados.",
      () => setResultsVisible(checked)
    );
  }

  function handleSetAllModules(visible: boolean) {
    void runVisibilityAction(
      visible ? "A ativar todos os módulos..." : "A desativar todos os módulos...",
      visible ? "Todos os módulos ficaram ativos." : "Todos os módulos ficaram ocultos.",
      visible ? "Falha ao ativar todos os módulos." : "Falha ao desativar todos os módulos.",
      () => setAllModules(visible)
    );
  }

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
        onActivateEvent={(value) => void handleActivateEvent(value)}
        onOpenAdvanced={() => setAdvancedOpen(true)}
        onToggleQuickModule={handleModuleToggle}
        onUpdatePhase={(phase) => void handleUpdatePhase(phase)}
        pendingCount={pendingCount}
        phaseLabels={PHASE_LABELS}
        phaseOptions={PHASE_OPTIONS}
        quickModuleItems={quickModuleItems}
        savingKey={savingKey}
        state={currentState}
        visibilitySavingKey={visibilitySavingKey}
        visibleCount={visibleCount}
      />

      <AdminSettingsAdvancedSheet
        activeEventName={activeEventName}
        advancedModuleItems={advancedModuleItems}
        allDisabled={allDisabled}
        allEnabled={allEnabled}
        eventId={eventId}
        feedback={feedback}
        loading={loading}
        onOpenChange={setAdvancedOpen}
        onRefresh={onRefresh}
        onSetAllModules={handleSetAllModules}
        onSetNominationsVisible={handleNominationsVisibility}
        onSetResultsVisible={handleResultsVisibility}
        onToggleAdvancedModule={handleModuleToggle}
        open={advancedOpen}
        secretSantaState={secretSantaState}
        state={currentState}
        visibilitySavingKey={visibilitySavingKey}
      />
    </div>
  );
}
