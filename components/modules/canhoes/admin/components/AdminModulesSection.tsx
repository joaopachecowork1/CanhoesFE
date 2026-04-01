"use client";

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

  if (!state) {
    return <AdminStateMessage variant="panel">{adminCopy.state.noState}</AdminStateMessage>;
  }

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

  const isSavingBulk =
    savingKey === "all-enabled" || savingKey === "all-disabled";

  return (
    <div className="space-y-4">
      <section className="canhoes-paper-panel rounded-[var(--radius-lg-token)] px-4 py-4 sm:px-5">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="editorial-kicker text-[var(--bark)]">Modules</p>
            <h2 className="text-lg font-semibold text-[var(--text-ink)]">
              Module visibility
            </h2>
            <p className="text-sm leading-6 text-[var(--bark)]/76">
              Este e o unico sitio onde a mesa decide o que o grupo ve em cada
              modulo.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {visibleCount}/{moduleItems.length} modulos visiveis
              </Badge>
              <Badge variant="outline">
                {state.nominationsVisible ? "Nomeacoes abertas" : "Nomeacoes fechadas"}
              </Badge>
              <Badge variant="outline">
                {state.resultsVisible ? "Resultados abertos" : "Resultados fechados"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={allEnabled || isSavingBulk}
                onClick={() => void setAllModules(true)}
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
              >
                {savingKey === "all-disabled"
                  ? adminCopy.state.saving
                  : adminCopy.state.disableAll}
              </Button>
            </div>
          </div>

          <div className="rounded-[var(--radius-md-token)] border border-[rgba(107,76,42,0.12)] bg-[rgba(251,244,232,0.72)] px-4 py-1">
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

      {(Object.keys(itemsByGroup) as Array<keyof typeof itemsByGroup>).map((groupKey) => {
        const items = itemsByGroup[groupKey];
        if (items.length === 0) return null;

        return (
          <section
            key={groupKey}
            className="canhoes-paper-card rounded-[var(--radius-lg-token)] px-4 py-4 sm:px-5"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {groupKey === "core" ? (
                  <Layers3 className="h-4 w-4 text-[var(--moss)]" />
                ) : groupKey === "community" ? (
                  <Sparkles className="h-4 w-4 text-[var(--accent-purple-soft)]" />
                ) : (
                  <Trophy className="h-4 w-4 text-[var(--bark)]" />
                )}
                <p className="editorial-kicker text-[var(--bark)]">
                  {GROUP_LABELS[groupKey]}
                </p>
              </div>

              <div className="divide-y divide-[rgba(107,76,42,0.12)]">
                {items.map((item) => (
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
        );
      })}

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
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--text-ink)]">
            {label}
          </p>
          <Badge
            variant={checked ? "secondary" : "outline"}
            className={cn(
              "shadow-none",
              checked &&
                "border-[var(--border-purple)] bg-[rgba(177,140,255,0.12)] text-[var(--accent-purple-deep)]"
            )}
          >
            {statusLabel}
          </Badge>
        </div>
        <p className="text-sm leading-6 text-[var(--bark)]/76">{description}</p>
      </div>

      <Switch
        checked={checked}
        disabled={pending}
        onCheckedChange={onChange}
        className={
          checked
            ? "border-[var(--border-purple)] bg-[rgba(122,173,58,0.92)] shadow-[var(--glow-purple-sm)]"
            : "border-[var(--border-subtle)] bg-[rgba(62,53,78,0.72)]"
        }
      />
    </div>
  );
}
