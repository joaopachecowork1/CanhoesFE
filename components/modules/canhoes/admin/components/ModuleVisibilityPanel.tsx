"use client";

import { Eye, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { adminCopy } from "@/lib/canhoesCopy";
import type { ModuleVisibilityItem } from "@/hooks/useModuleVisibility";

type ModuleVisibilityPanelProps = {
  allDisabled: boolean;
  allEnabled: boolean;
  moduleItems: ReadonlyArray<ModuleVisibilityItem>;
  nominationsVisible: boolean;
  onDisableAll: () => void;
  onEnableAll: () => void;
  onToggleModule: (moduleKey: ModuleVisibilityItem["key"], checked: boolean) => void;
  onVisibilityChange: (type: "nominations" | "results", checked: boolean) => void;
  resultsVisible: boolean;
  savingKey: string | null;
  visibleCount: number;
};

const GROUP_LABELS = {
  core: adminCopy.state.groupCore,
  community: adminCopy.state.groupCommunity,
  finale: adminCopy.state.groupFinale,
} as const;

export function ModuleVisibilityPanel({
  allDisabled,
  allEnabled,
  moduleItems,
  nominationsVisible,
  onDisableAll,
  onEnableAll,
  onToggleModule,
  onVisibilityChange,
  resultsVisible,
  savingKey,
  visibleCount,
}: Readonly<ModuleVisibilityPanelProps>) {
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
    <Card className="border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2 text-[var(--accent-purple-soft)]">
          <Eye className="h-4 w-4" />
          <span className="label">{adminCopy.state.visibilityKicker}</span>
        </div>
        <CardTitle>{adminCopy.state.visibilityTitle}</CardTitle>
        <p className="body-small text-[var(--beige)]/72">
          {adminCopy.state.visibilityDescription}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="label text-[var(--bark)]/62">
                {adminCopy.state.visibilityActionsLabel}
              </p>
              <p className="text-sm text-[var(--bark)]/76">
                {visibleCount}/{moduleItems.length} modulos disponiveis para o
                grupo
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={allEnabled || isSavingBulk}
                onClick={onEnableAll}
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
                onClick={onDisableAll}
              >
                {savingKey === "all-disabled"
                  ? adminCopy.state.saving
                  : adminCopy.state.disableAll}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <VisibilityToggleCard
            checked={nominationsVisible}
            description={adminCopy.state.nominationsDescription}
            effective={nominationsVisible}
            label={adminCopy.state.nominationsVisible}
            onChange={(checked) => onVisibilityChange("nominations", checked)}
            pending={savingKey === "nominations"}
          />
          <VisibilityToggleCard
            checked={resultsVisible}
            description={adminCopy.state.resultsDescription}
            effective={resultsVisible}
            label={adminCopy.state.resultsVisible}
            onChange={(checked) => onVisibilityChange("results", checked)}
            pending={savingKey === "results"}
          />
        </div>

        {(
          Object.keys(itemsByGroup) as Array<keyof typeof itemsByGroup>
        ).map((groupKey) => {
          const items = itemsByGroup[groupKey];
          if (items.length === 0) return null;

          return (
            <section key={groupKey} className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--accent-purple-soft)]" />
                <p className="editorial-kicker text-[var(--accent-purple-soft)]">
                  {GROUP_LABELS[groupKey]}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((moduleItem) => (
                  <VisibilityToggleCard
                    key={moduleItem.key}
                    checked={moduleItem.checked}
                    description={moduleItem.description}
                    effective={moduleItem.effective}
                    label={moduleItem.label}
                    onChange={(checked) =>
                      onToggleModule(moduleItem.key, checked)
                    }
                    pending={savingKey === moduleItem.key}
                  />
                ))}
              </div>
            </section>
          );
        })}

        <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-4 py-3">
          <div className="flex items-center gap-2 text-[var(--text-ink)]">
            <Sparkles className="h-4 w-4 text-[var(--accent-purple-soft)]" />
            <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em]">
              {adminCopy.state.visibilityRuleTitle}
            </p>
          </div>
          <p className="mt-2 text-sm text-[var(--bark)]/76">
            {adminCopy.state.visibilityRuleDescription}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function VisibilityToggleCard({
  checked,
  description,
  effective,
  label,
  onChange,
  pending,
}: Readonly<{
  checked: boolean;
  description: string;
  effective: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  pending: boolean;
}>) {
  return (
    <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--text-ink)]">
              {label}
            </p>
            <Badge
              variant={effective ? "secondary" : "outline"}
              className={
                effective
                  ? "border-[var(--border-purple)] bg-[rgba(177,140,255,0.14)] text-[var(--accent-purple-deep)] shadow-[var(--glow-purple-sm)]"
                  : ""
              }
            >
              {effective ? "Visivel" : "Oculto"}
            </Badge>
          </div>
          <p className="text-sm text-[var(--bark)]/76">{description}</p>
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
    </div>
  );
}
