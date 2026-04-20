"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useEventOverview } from "@/hooks/useEventOverview";
import { getPhaseLabel, getPhaseSummary, formatPhaseWindow } from "@/lib/canhoesEvent";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import type { EventHomeSnapshotDto as CanhoesEventHomeSnapshot } from "@/lib/api/types";

export type HomeAction = {
  label: string;
  href: string;
  tone: "default" | "outline" | "secondary";
  onClick?: () => void;
};

export type CanhoesEventHomeViewModel = {
  event: NonNullable<Awaited<ReturnType<typeof useEventOverview>>["event"]>;
  homeCopy: {
    alerts: string[];
    primaryAction: HomeAction;
    secondaryAction: HomeAction;
  };
  overview: NonNullable<Awaited<ReturnType<typeof useEventOverview>>["overview"]>;
  phaseDeadline: string | null;
  phaseLabel: string;
  phaseSummary: string;
  recentPosts: CanhoesEventHomeSnapshot["recentPosts"];
  secretSanta: CanhoesEventHomeSnapshot["secretSanta"];
  secretSantaAction: HomeAction;
  voting: CanhoesEventHomeSnapshot["voting"];
  wishlistAction: HomeAction;
};

export function useCanhoesEventHome() {
  const { event, error: overviewError, isLoading: isOverviewLoading, overview } = useEventOverview();
  const eventId = event?.id ?? null;

  const { data: homeSnapshot, isLoading: isSnapshotLoading, error: snapshotError } = useQuery({
    queryKey: ["canhoes", "home-snapshot", eventId],
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.getEventHomeSnapshot(eventId!),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const viewModel = useMemo(() => {
    if (!event || !overview || !homeSnapshot) return null;

    return {
      event,
      homeCopy: {
        alerts: [],
        primaryAction: { label: "Abrir", href: "/canhoes", tone: "default" as const },
        secondaryAction: { label: "Abrir", href: "/canhoes", tone: "outline" as const },
      },
      overview,
      phaseDeadline: formatPhaseWindow(overview.activePhase) ?? "S/A definir",
      phaseLabel: getPhaseLabel(overview.activePhase?.type),
      phaseSummary: getPhaseSummary(overview.activePhase?.type),
      recentPosts: homeSnapshot.recentPosts,
      secretSanta: homeSnapshot.secretSanta,
      secretSantaAction: { label: "Abrir", href: "/canhoes", tone: "outline" as const },
      voting: homeSnapshot.voting,
      wishlistAction: { label: "Abrir", href: "/canhoes", tone: "secondary" as const },
    } satisfies CanhoesEventHomeViewModel;
  }, [event, homeSnapshot, overview]);

  const errorMessage = overviewError?.message ?? (snapshotError instanceof Error ? snapshotError.message : null);

  return {
    errorMessage,
    isLoading: isOverviewLoading || isSnapshotLoading,
    viewModel,
  };
}
