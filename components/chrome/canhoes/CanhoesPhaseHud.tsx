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
      <div className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[rgba(212,184,150,0.12)] bg-[rgba(244,234,216,0.08)] px-3 py-1 text-[rgba(243,234,216,0.72)]">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--moss)]" />
        <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em]">
          A abrir
        </span>
      </div>
    );
  }

  if (!event || !overview) return null;

  const phaseLabel = getPhaseLabel(overview.activePhase?.type);

  return (
    <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[rgba(212,184,150,0.12)] bg-[rgba(244,234,216,0.08)] px-3 py-1">
      <Sparkles className="h-3.5 w-3.5 text-[var(--moss)]" />
      <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[rgba(243,234,216,0.8)]">
        {event.name}
      </span>
      <span className="text-xs font-semibold text-[var(--bg-paper)]">
        {phaseLabel}
      </span>
    </div>
  );
}
