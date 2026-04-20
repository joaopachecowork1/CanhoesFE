"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useEventOverview } from "@/hooks/useEventOverview";
import { getPhaseLabel, getPhaseSummary, formatPhaseWindow } from "@/lib/canhoesEvent";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

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
      homeCopy: { alerts: [], primaryAction: { label: "Abrir", href: "/canhoes" }, secondaryAction: { label: "Abrir", href: "/canhoes" } },
      overview,
      phaseDeadline: formatPhaseWindow(overview.activePhase) ?? "S/A definir",
      phaseLabel: getPhaseLabel(overview.activePhase?.type),
      phaseSummary: getPhaseSummary(overview.activePhase?.type),
      recentPosts: homeSnapshot.recentPosts,
      secretSanta: homeSnapshot.secretSanta,
      secretSantaAction: { label: "Abrir", href: "/canhoes" },
      voting: homeSnapshot.voting,
      wishlistAction: { label: "Abrir", href: "/canhoes" },
    };
  }, [event, homeSnapshot, overview]);

  const errorMessage = overviewError?.message ?? (snapshotError instanceof Error ? snapshotError.message : null);

  return {
    errorMessage,
    isLoading: isOverviewLoading || isSnapshotLoading,
    viewModel,
  };
}
