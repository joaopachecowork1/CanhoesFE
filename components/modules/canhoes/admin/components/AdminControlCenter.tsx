"use client";

import type {
  AdminModuleKey,
  EventAdminStateDto,
  EventPhaseDto,
} from "@/lib/api/types";

import type { ModuleVisibilityItem } from "@/hooks/useModuleVisibility";

import { AdminStateMessage } from "./AdminStateMessage";
import {
  ADVANCED_ADMIN_MODULE_ORDER,
  QUICK_ADMIN_MODULE_ORDER,
} from "../adminContentSections";
import { useAdminControlCenter, PHASE_LABELS } from "../hooks/useAdminControlCenter";
import { getPhaseLabel } from "@/lib/canhoesEvent";
import { AdminSettingsMainPanel, AdminSettingsAdvancedSheet } from "./AdminControlCenterPanels";

export const PHASE_OPTIONS = Object.keys(PHASE_LABELS) as EventPhaseDto["type"][];

export function selectModuleItems(
  order: readonly AdminModuleKey[],
  itemsByKey: Partial<Record<AdminModuleKey, ModuleVisibilityItem>>
) {
  return order.map((key) => itemsByKey[key]).filter((item): item is ModuleVisibilityItem => Boolean(item));
}


type AdminControlCenterProps = {
  activeEventName: string | null;
  eventId: string | null;
  events: Array<{ id: string; name: string }>;
  loading: boolean;
  onRefresh: () => Promise<void>;
  state: EventAdminStateDto | null;
};

function buildModuleItemsByKey(moduleItems: ModuleVisibilityItem[]) {
  return Object.fromEntries(moduleItems.map((item) => [item.key, item])) as Partial<
    Record<AdminModuleKey, ModuleVisibilityItem>
  >;
}

export function AdminControlCenter({
  activeEventName,
  eventId,
  events,
  loading,
  onRefresh,
  state,
}: Readonly<AdminControlCenterProps>) {
  const {
    state: hookState,
    actions,
  } = useAdminControlCenter(eventId, state, events, onRefresh);

  const {
    advancedOpen,
    feedback,
    allDisabled,
    allEnabled,
    moduleItems,
    visibilitySavingKey,
    visibleCount,
  } = hookState;

  const {
    setAdvancedOpen,
    handleUpdatePhase,
    handleActivateEvent,
    handleModuleToggle,
    handleNominationsVisibility,
    handleResultsVisibility,
    handleSetAllModules,
  } = actions;

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
