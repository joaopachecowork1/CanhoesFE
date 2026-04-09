"use client";

import { Loader2, Sparkles } from "lucide-react";

import type { EventOverviewDto, EventSummaryDto } from "@/lib/api/types";
import { getPhaseLabel } from "@/lib/canhoesEvent";

export function CanhoesPhaseHud({
  event,
  isLoading = false,
  overview,
}: Readonly<{
  event?: EventSummaryDto | null;
  isLoading?: boolean;
  overview?: EventOverviewDto | null;
}>) {
  if (isLoading) {
    return (
      <div className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[rgba(212,184,150,0.12)] bg-[rgba(18,23,12,0.72)] px-3 py-1.5 text-[rgba(245,237,224,0.7)]">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--neon-green)]" />
        <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em]">
          A abrir
        </span>
      </div>
    );
  }

  if (!event || !overview) return null;

  const phaseLabel = getPhaseLabel(overview.activePhase?.type);

  return (
    <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[rgba(177,140,255,0.18)] bg-[rgba(18,23,12,0.72)] px-3 py-1.5">
      <Sparkles className="h-3.5 w-3.5 text-[var(--accent-purple)]" />
      <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[rgba(245,237,224,0.86)]">
        {event.name}
      </span>
      <span className="text-xs font-semibold text-[var(--bg-paper)]">
        {phaseLabel}
      </span>
    </div>
  );
}
