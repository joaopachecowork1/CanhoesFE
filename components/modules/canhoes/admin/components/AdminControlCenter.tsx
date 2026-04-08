"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Gift, Layers, Settings2, Timer, ToggleRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModuleVisibility, type ModuleVisibilityItem } from "@/hooks/useModuleVisibility";
import { adminCopy } from "@/lib/canhoesCopy";
import { cn } from "@/lib/utils";
import type {
  EventAdminSecretSantaStateDto,
  EventAdminStateDto,
  EventPhaseDto,
} from "@/lib/api/types";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { getErrorMessage, logFrontendError } from "@/lib/errors";

import { AdminStateMessage } from "./AdminStateMessage";
import { SecretSantaAdmin } from "./SecretSantaAdmin";

type AdminControlCenterProps = {
  activeEventName: string | null;
  eventId: string | null;
  events: Array<{ id: string; name: string }>;
  loading: boolean;
  onRefresh: () => Promise<void>;
  secretSantaState: EventAdminSecretSantaStateDto | null;
  state: EventAdminStateDto | null;
};

const GROUP_LABELS = {
  community: adminCopy.state.groupCommunity,
  core: adminCopy.state.groupCore,
  finale: adminCopy.state.groupFinale,
} as const;

const PHASE_LABELS: Record<EventPhaseDto["type"], string> = {
  PROPOSALS: "Nomeações",
  VOTING: "Votação",
  RESULTS: "Resultados",
  DRAW: "Sorteio",
};

export function AdminControlCenter({
  activeEventName,
  eventId,
  events,
  loading,
  onRefresh,
  secretSantaState,
  state,
}: Readonly<AdminControlCenterProps>) {
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [activeModuleGroup, setActiveModuleGroup] = useState<ModuleVisibilityItem["group"]>("core");

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

  const handleUpdatePhase = useCallback(
    async (phaseType: EventPhaseDto["type"]) => {
      if (!eventId) return;

      setSavingKey("phase");
      try {
        await canhoesEventsRepo.updateAdminPhase(eventId, { phaseType });
        await onRefresh();
        toast.success("Fase do evento atualizada");
      } catch (err) {
        logFrontendError("AdminControlCenter.updatePhase", err, { phaseType });
        toast.error(getErrorMessage(err, "Não foi possível mudar a fase."));
      } finally {
        setSavingKey(null);
      }
    },
    [eventId, onRefresh]
  );

  const handleActivateEvent = useCallback(
    async (eventIdToActivate: string) => {
      if (!eventIdToActivate || eventIdToActivate === eventId) return;

      setSavingKey("activate-event");
      try {
        await canhoesEventsRepo.adminActivateEvent(eventIdToActivate);
        await onRefresh();
        toast.success("Evento ativo atualizado");
      } catch (err) {
        logFrontendError("AdminControlCenter.activateEvent", err, { eventId: eventIdToActivate });
        toast.error(getErrorMessage(err, "Não foi possível mudar o evento ativo."));
      } finally {
        setSavingKey(null);
      }
    },
    [eventId, onRefresh]
  );

  const itemsByGroup = useMemo(() => {
    return moduleItems.reduce<Record<ModuleVisibilityItem["group"], ModuleVisibilityItem[]>>(
      (acc, item) => {
        acc[item.group].push(item);
        return acc;
      },
      { core: [], community: [], finale: [] }
    );
  }, [moduleItems]);

  const availableGroups = useMemo(
    () => (["core", "community", "finale"] as const).filter((g) => itemsByGroup[g].length > 0),
    [itemsByGroup]
  );

  const visibleGroup = availableGroups.includes(activeModuleGroup)
    ? activeModuleGroup
    : availableGroups[0] ?? "core";

  const isSavingBulk =
    visibilitySavingKey === "all-enabled" || visibilitySavingKey === "all-disabled";

  if (!state) {
    return <AdminStateMessage variant="panel">{adminCopy.state.noState}</AdminStateMessage>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(122,173,58,0.12),transparent_36%),linear-gradient(180deg,rgba(16,20,11,0.96),rgba(10,13,8,0.98))] px-5 py-5 shadow-[var(--shadow-panel)]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-[var(--neon-green)]" />
              <p className="editorial-kicker text-[var(--neon-green)]">Control Center</p>
            </div>
            <h2 className="text-xl font-semibold text-[var(--bg-paper)]">
              Configurações do Evento
            </h2>
            <p className="text-sm leading-6 text-[rgba(245,237,224,0.78)]">
              Painel unificado para controlar visibilidade, fases e estado do evento.
            </p>
          </div>

          <Badge className="border-[rgba(212,184,150,0.18)] bg-[rgba(16,20,11,0.88)] text-[var(--bg-paper)] shadow-none">
            {visibleCount}/{moduleItems.length} módulos visíveis
          </Badge>
        </div>
      </section>

      {/* Evento Ativo */}
      <section className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[linear-gradient(180deg,rgba(18,24,11,0.96),rgba(12,16,8,0.98))] px-5 py-5 shadow-[var(--shadow-panel)]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[var(--neon-green)]" />
            <h3 className="text-base font-semibold text-[var(--bg-paper)]">Evento Ativo</h3>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={eventId ?? ""} onValueChange={handleActivateEvent} disabled={savingKey === "activate-event"}>
              <SelectTrigger className="border-[rgba(212,184,150,0.2)] bg-[rgba(12,16,8,0.8)] text-[var(--bg-paper)]">
                <SelectValue placeholder="Selecionar evento" />
              </SelectTrigger>
              <SelectContent className="bg-[rgba(18,23,12,0.98)] border-[rgba(212,184,150,0.2)]">
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id} className="text-[var(--bg-paper)] focus:bg-[rgba(122,173,58,0.18)]">
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeEventName && (
              <p className="text-sm text-[rgba(245,237,224,0.76)]">
                Evento atual: <span className="font-semibold text-[var(--bg-paper)]">{activeEventName}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Fase do Evento */}
      <section className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[linear-gradient(180deg,rgba(18,24,11,0.96),rgba(12,16,8,0.98))] px-5 py-5 shadow-[var(--shadow-panel)]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-[var(--neon-green)]" />
            <h3 className="text-base font-semibold text-[var(--bg-paper)]">Fase do Evento</h3>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={state.activePhase?.type ?? ""}
              onValueChange={(value) => void handleUpdatePhase(value as EventPhaseDto["type"])}
              disabled={savingKey === "phase" || loading}
            >
              <SelectTrigger className="border-[rgba(212,184,150,0.2)] bg-[rgba(12,16,8,0.8)] text-[var(--bg-paper)]">
                <SelectValue placeholder="Selecionar fase" />
              </SelectTrigger>
              <SelectContent className="bg-[rgba(18,23,12,0.98)] border-[rgba(212,184,150,0.2)]">
                {(Object.keys(PHASE_LABELS) as EventPhaseDto["type"][]).map((phase) => (
                  <SelectItem key={phase} value={phase} className="text-[var(--bg-paper)] focus:bg-[rgba(122,173,58,0.18)]">
                    {PHASE_LABELS[phase]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {state.activePhase && (
              <Badge className="border-[rgba(122,173,58,0.35)] bg-[rgba(45,68,24,0.92)] text-[var(--bg-paper)] shadow-none">
                Fase atual: {PHASE_LABELS[state.activePhase.type]}
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Visibilidade de Módulos */}
      <section className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[radial-gradient(circle_at_top,rgba(122,173,58,0.1),transparent_40%),linear-gradient(180deg,rgba(18,24,11,0.94),rgba(11,14,8,0.96))] px-5 py-5 text-[var(--bg-paper)] shadow-[var(--shadow-panel)]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ToggleRight className="h-5 w-5 text-[var(--neon-green)]" />
              <h3 className="text-base font-semibold text-[var(--bg-paper)]">
                Visibilidade de Módulos
              </h3>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={allEnabled || isSavingBulk}
                onClick={() => void setAllModules(true)}
                className="border-[rgba(122,173,58,0.3)] bg-[rgba(31,44,18,0.92)] text-[var(--bg-paper)] hover:bg-[rgba(42,58,24,0.95)]"
              >
                {visibilitySavingKey === "all-enabled" ? "A guardar..." : "Ativar Todos"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={allDisabled || isSavingBulk}
                onClick={() => void setAllModules(false)}
                className="border-[rgba(212,184,150,0.2)] bg-[rgba(18,23,12,0.92)] text-[var(--bg-paper)] hover:bg-[rgba(28,36,18,0.96)]"
              >
                {visibilitySavingKey === "all-disabled" ? "A guardar..." : "Desativar Todos"}
              </Button>
            </div>
          </div>

          {/* Toggles rápidos */}
          <div className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(12,16,8,0.7)] px-4 py-3">
            <div className="space-y-3">
              <VisibilityRow
                checked={state.nominationsVisible}
                description="Permitir que membros vejam nomeações submetidas"
                label="Nomeações Visíveis"
                onChange={(checked) => void setNominationsVisible(checked)}
                pending={visibilitySavingKey === "nominations"}
              />
              <VisibilityRow
                checked={state.resultsVisible}
                description="Permitir que membros vejam resultados da votação"
                label="Resultados Visíveis"
                onChange={(checked) => void setResultsVisible(checked)}
                pending={visibilitySavingKey === "results"}
              />
            </div>
          </div>

          {/* Módulos por grupo */}
          {availableGroups.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableGroups.map((groupKey) => {
                const isActive = groupKey === visibleGroup;
                const count = itemsByGroup[groupKey].filter((item) => item.checked).length;
                const total = itemsByGroup[groupKey].length;

                return (
                  <button
                    key={groupKey}
                    type="button"
                    onClick={() => setActiveModuleGroup(groupKey)}
                    className={cn(
                      "inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "border-[rgba(122,173,58,0.5)] bg-[linear-gradient(180deg,rgba(36,49,23,0.98),rgba(18,24,11,0.98))] text-[var(--bg-paper)] shadow-[var(--glow-green-sm)]"
                        : "border-[rgba(212,184,150,0.14)] bg-[rgba(18,23,12,0.74)] text-[rgba(245,237,224,0.9)] hover:bg-[rgba(28,36,18,0.92)]"
                    )}
                  >
                    <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.1em]">
                      {GROUP_LABELS[groupKey]}
                    </span>
                    <Badge
                      className={cn(
                        "rounded-full px-1.5 text-[0.65rem] shadow-none",
                        isActive
                          ? "border-[rgba(255,255,255,0.24)] bg-[rgba(255,255,255,0.16)]"
                          : "border-[rgba(122,173,58,0.24)] bg-[rgba(122,173,58,0.18)]"
                      )}
                    >
                      {count}/{total}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}

          {/* Lista de módulos */}
          <div className="divide-y divide-[rgba(212,184,150,0.14)]">
            {itemsByGroup[visibleGroup].map((item) => (
              <VisibilityRow
                key={item.key}
                checked={item.checked}
                description={item.description}
                label={item.label}
                onChange={(checked) => void toggleModule(item.key, checked)}
                pending={visibilitySavingKey === item.key}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Secret Santa */}
      <section className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[radial-gradient(circle_at_top,rgba(177,140,255,0.12),transparent_40%),linear-gradient(180deg,rgba(18,24,11,0.94),rgba(11,14,8,0.96))] px-5 py-5 text-[var(--bg-paper)] shadow-[var(--shadow-panel)]">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-5 w-5 text-[var(--accentPurple)]" />
          <h3 className="text-base font-semibold text-[var(--bg-paper)]">
            Amigo Secreto
          </h3>
        </div>
        <SecretSantaAdmin
          activeEventName={activeEventName}
          eventId={eventId}
          loading={loading}
          onUpdate={onRefresh}
          state={secretSantaState}
        />
      </section>
    </div>
  );
}

function VisibilityRow({
  checked,
  description,
  label,
  onChange,
  pending,
}: Readonly<{
  checked: boolean;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
  pending: boolean;
}>) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0 space-y-1.5">
        <p className="font-medium text-[var(--bg-paper)]">{label}</p>
        <p className="text-sm leading-6 text-[rgba(245,237,224,0.76)]">{description}</p>
      </div>

      <Switch
        checked={checked}
        disabled={pending}
        onCheckedChange={onChange}
        className={cn(
          "transition-all duration-200",
          checked
            ? "border-[var(--border-purple)] bg-[rgba(122,173,58,0.92)] shadow-[var(--glow-purple-sm)]"
            : "border-[rgba(212,184,150,0.22)] bg-[rgba(62,53,78,0.82)]"
        )}
      />
    </div>
  );
}
