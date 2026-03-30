"use client";

import { Eye, Layers3, Sparkles, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useModuleVisibility } from "@/hooks/useModuleVisibility";
import { adminCopy } from "@/lib/canhoesCopy";
import type { EventAdminStateDto } from "@/lib/api/types";

import { ModuleVisibilityPanel } from "./ModuleVisibilityPanel";

type ModuleVisibilityAdminProps = {
  eventId: string | null;
  onUpdate: () => Promise<void>;
  state: EventAdminStateDto | null;
};

export function ModuleVisibilityAdmin({
  eventId,
  onUpdate,
  state,
}: Readonly<ModuleVisibilityAdminProps>) {
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
    return (
      <Card className="border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
        <CardContent className="py-6 text-sm text-[var(--beige)]/76">
          {adminCopy.state.noState}
        </CardContent>
      </Card>
    );
  }

  const groupedCounts = moduleItems.reduce<
    Record<"community" | "core" | "finale", { total: number; visible: number }>
  >(
    (accumulator, item) => {
      accumulator[item.group].total += 1;
      if (item.effective) {
        accumulator[item.group].visible += 1;
      }
      return accumulator;
    },
    {
      core: { total: 0, visible: 0 },
      community: { total: 0, visible: 0 },
      finale: { total: 0, visible: 0 },
    }
  );

  return (
    <div className="space-y-4">
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

        <CardContent className="grid gap-3 md:grid-cols-3">
          <VisibilitySummaryCard
            icon={<Layers3 className="h-4 w-4" />}
            label={adminCopy.state.groupCore}
            value={`${groupedCounts.core.visible}/${groupedCounts.core.total}`}
          />
          <VisibilitySummaryCard
            icon={<Sparkles className="h-4 w-4" />}
            label={adminCopy.state.groupCommunity}
            value={`${groupedCounts.community.visible}/${groupedCounts.community.total}`}
          />
          <VisibilitySummaryCard
            icon={<Trophy className="h-4 w-4" />}
            label={adminCopy.state.groupFinale}
            value={`${groupedCounts.finale.visible}/${groupedCounts.finale.total}`}
          />
        </CardContent>
      </Card>

      <ModuleVisibilityPanel
        allDisabled={allDisabled}
        allEnabled={allEnabled}
        moduleItems={moduleItems}
        nominationsVisible={state.nominationsVisible}
        onDisableAll={() => void setAllModules(false)}
        onEnableAll={() => void setAllModules(true)}
        onToggleModule={(moduleKey, checked) =>
          void toggleModule(moduleKey, checked)
        }
        onVisibilityChange={(type, checked) =>
          void (type === "nominations"
            ? setNominationsVisible(checked)
            : setResultsVisible(checked))
        }
        resultsVisible={state.resultsVisible}
        savingKey={savingKey}
        visibleCount={visibleCount}
      />
    </div>
  );
}

function VisibilitySummaryCard({
  icon,
  label,
  value,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string;
}>) {
  return (
    <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-purple)] bg-[rgba(138,92,255,0.12)] text-[var(--accent-purple-soft)] shadow-[var(--glow-purple-sm)]">
          {icon}
        </span>
        <p className="text-2xl font-semibold text-[var(--text-ink)]">{value}</p>
      </div>
      <p className="mt-3 font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--bark)]/64">
        {label}
      </p>
    </div>
  );
}
