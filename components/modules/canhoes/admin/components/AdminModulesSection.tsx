"use client";

import { useMemo, useState } from "react";
import { Layers3, Sparkles, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useModuleVisibility, type ModuleVisibilityItem } from "@/hooks/useModuleVisibility";
import { adminCopy } from "@/lib/canhoesCopy";
import { cn } from "@/lib/utils";
import type {
  EventAdminSecretSantaStateDto,
  EventAdminStateDto,
} from "@/lib/api/types";

import { AdminStateMessage } from "./AdminStateMessage";
import { SecretSantaAdmin } from "./SecretSantaAdmin";

type AdminModulesSectionProps = {
  activeEventName: string | null;
  eventId: string | null;
  loading: boolean;
  onUpdate: () => Promise<void>;
  secretSantaState: EventAdminSecretSantaStateDto | null;
  state: EventAdminStateDto | null;
};

const GROUP_LABELS = {
  community: adminCopy.state.groupCommunity,
  core: adminCopy.state.groupCore,
  finale: adminCopy.state.groupFinale,
} as const;

export function AdminModulesSection({
  activeEventName,
  eventId,
  loading,
  onUpdate,
  secretSantaState,
  state,
}: Readonly<AdminModulesSectionProps>) {
  const {
    allDisabled,
    allEnabled,
    moduleItems,
    savingKey,
    setAllModules,
    setNominationsVisible,
    setResultsVisible,
    toggleModule,
    visibleCount,
  } = useModuleVisibility({
    eventId,
    onUpdate,
    state,
  });

  const itemsByGroup = moduleItems.reduce<
    Record<ModuleVisibilityItem["group"], ModuleVisibilityItem[]>
  >(
    (accumulator, moduleItem) => {
      accumulator[moduleItem.group].push(moduleItem);
      return accumulator;
    },
    {
      core: [],
      community: [],
      finale: [],
    }
  );

  const groupOrder: Array<ModuleVisibilityItem["group"]> = ["core", "community", "finale"];
  const availableGroups = useMemo(
    () => groupOrder.filter((groupKey) => itemsByGroup[groupKey].length > 0),
    [itemsByGroup]
  );
  const [activeGroup, setActiveGroup] = useState<ModuleVisibilityItem["group"]>(
    availableGroups[0] ?? "core"
  );
  const visibleGroup = availableGroups.includes(activeGroup)
    ? activeGroup
    : availableGroups[0] ?? "core";

  if (!state) {
    return <AdminStateMessage variant="panel">{adminCopy.state.noState}</AdminStateMessage>;
  }

  const isSavingBulk =
    savingKey === "all-enabled" || savingKey === "all-disabled";

  return (
    <div className="space-y-5">
      <section className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.18),transparent_34%),linear-gradient(180deg,rgba(18,24,11,0.96),rgba(12,16,8,0.98))] px-4 py-4 text-[var(--bg-paper)] shadow-[var(--shadow-panel)] sm:px-5">
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="editorial-kicker text-[var(--neon-green)]">Modules</p>
            <h2 className="text-lg font-semibold text-[var(--bg-paper)]">
              Module visibility
            </h2>
            <p className="text-sm leading-6 text-[rgba(245,237,224,0.78)]">
              Este e o unico sitio onde a mesa decide o que o grupo ve em cada
              modulo.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge className="border-[rgba(212,184,150,0.18)] bg-[rgba(16,20,11,0.88)] text-[var(--bg-paper)] shadow-none">
                {visibleCount}/{moduleItems.length} modulos visiveis
              </Badge>
              <Badge className="border-[rgba(177,140,255,0.28)] bg-[rgba(177,140,255,0.16)] text-[var(--bg-paper)] shadow-none">
                {state.nominationsVisible ? "Nomeacoes abertas" : "Nomeacoes fechadas"}
              </Badge>
              <Badge className="border-[rgba(177,140,255,0.28)] bg-[rgba(177,140,255,0.16)] text-[var(--bg-paper)] shadow-none">
                {state.resultsVisible ? "Resultados abertos" : "Resultados fechados"}
              </Badge>
            </div>

            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={allEnabled || isSavingBulk}
                onClick={() => void setAllModules(true)}
                className="w-full border-[rgba(122,173,58,0.3)] bg-[rgba(31,44,18,0.92)] text-[var(--bg-paper)] hover:bg-[rgba(42,58,24,0.95)] sm:w-auto"
              >
                {savingKey === "all-enabled"
                  ? adminCopy.state.saving
                  : adminCopy.state.enableAll}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={allDisabled || isSavingBulk}
                onClick={() => void setAllModules(false)}
                className="w-full border-[rgba(212,184,150,0.2)] bg-[rgba(18,23,12,0.92)] text-[var(--bg-paper)] hover:bg-[rgba(28,36,18,0.96)] sm:w-auto"
              >
                {savingKey === "all-disabled"
                  ? adminCopy.state.saving
                  : adminCopy.state.disableAll}
              </Button>
            </div>
          </div>

          <div className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(12,16,8,0.7)] px-4 py-1">
            <VisibilityRow
              checked={state.nominationsVisible}
              description={adminCopy.state.nominationsDescription}
              label={adminCopy.state.nominationsVisible}
              onChange={(checked) => void setNominationsVisible(checked)}
              pending={savingKey === "nominations"}
              statusLabel={state.nominationsVisible ? "ON" : "OFF"}
            />
            <VisibilityRow
              checked={state.resultsVisible}
              description={adminCopy.state.resultsDescription}
              label={adminCopy.state.resultsVisible}
              onChange={(checked) => void setResultsVisible(checked)}
              pending={savingKey === "results"}
              statusLabel={state.resultsVisible ? "ON" : "OFF"}
            />
          </div>
        </div>
      </section>

      {availableGroups.length > 0 ? (
        <section className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[radial-gradient(circle_at_top,rgba(122,173,58,0.1),transparent_40%),linear-gradient(180deg,rgba(18,24,11,0.94),rgba(11,14,8,0.96))] px-4 py-4 text-[var(--bg-paper)] shadow-[var(--shadow-panel)] sm:px-5">
          <div className="space-y-3">
            <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-none">
              <div className="flex min-w-max gap-2">
                {availableGroups.map((groupKey) => {
                  const isActive = visibleGroup === groupKey;
                  const groupCount = itemsByGroup[groupKey].filter((item) => item.checked).length;

                  return (
                    <button
                      key={groupKey}
                      type="button"
                      onClick={() => setActiveGroup(groupKey)}
                      className={cn(
                        "canhoes-tap inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                        isActive
                          ? "border-[rgba(122,173,58,0.48)] bg-[linear-gradient(180deg,rgba(36,49,23,0.98),rgba(18,24,11,0.98))] text-[var(--bg-paper)] shadow-[var(--glow-green-sm)]"
                          : "border-[rgba(212,184,150,0.14)] bg-[rgba(18,23,12,0.74)] text-[rgba(245,237,224,0.9)]"
                      )}
                      aria-pressed={isActive}
                    >
                      <GroupIcon groupKey={groupKey} />
                      <span>{GROUP_LABELS[groupKey]}</span>
                      <Badge className="rounded-full border-[rgba(122,173,58,0.24)] bg-[rgba(122,173,58,0.18)] px-1.5 text-[0.65rem] text-[var(--bg-paper)] shadow-none">
                        {groupCount}/{itemsByGroup[groupKey].length}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="divide-y divide-[rgba(212,184,150,0.14)]">
              {itemsByGroup[visibleGroup].map((item) => (
                <VisibilityRow
                  key={item.key}
                  checked={item.checked}
                  description={item.description}
                  label={item.label}
                  onChange={(checked) => void toggleModule(item.key, checked)}
                  pending={savingKey === item.key}
                  statusLabel={getModuleStatusLabel(item)}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <SecretSantaAdmin
        activeEventName={activeEventName}
        eventId={eventId}
        loading={loading}
        onUpdate={onUpdate}
        state={secretSantaState}
      />
    </div>
  );
}

function getModuleStatusLabel(item: ModuleVisibilityItem) {
  if (!item.checked) return "OFF";
  if (item.effective) return "ON";
  return "Fase";
}

function GroupIcon({ groupKey }: Readonly<{ groupKey: ModuleVisibilityItem["group"] }>) {
  if (groupKey === "core") {
    return <Layers3 className="h-4 w-4 text-[var(--moss)]" />;
  }
  if (groupKey === "community") {
    return <Sparkles className="h-4 w-4 text-[var(--accent-purple-soft)]" />;
  }
  return <Trophy className="h-4 w-4 text-[var(--neon-amber)]" />;
}

function VisibilityRow({
  checked,
  description,
  label,
  onChange,
  pending,
  statusLabel,
}: Readonly<{
  checked: boolean;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
  pending: boolean;
  statusLabel: string;
}>) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--bg-paper)]">
            {label}
          </p>
          <Badge
            variant={checked ? "default" : "secondary"}
            className={cn(
              "shadow-none",
              checked &&
                "border-[rgba(122,173,58,0.35)] bg-[rgba(45,68,24,0.92)] text-[var(--bg-paper)]"
            )}
          >
            {statusLabel}
          </Badge>
        </div>
        <p className="text-sm leading-6 text-[rgba(245,237,224,0.76)]">{description}</p>
      </div>

      <Switch
        checked={checked}
        disabled={pending}
        onCheckedChange={onChange}
        className={
          checked
            ? "border-[var(--border-purple)] bg-[rgba(122,173,58,0.92)] shadow-[var(--glow-purple-sm)]"
            : "border-[rgba(212,184,150,0.22)] bg-[rgba(62,53,78,0.82)]"
        }
      />
    </div>
  );
}
