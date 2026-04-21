"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getPhaseLabel, getPhaseSummary, formatPhaseWindow } from "@/lib/canhoesEvent";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import type { EventHomeSnapshotDto, EventOverviewDto, EventSummaryDto } from "@/lib/api/types";

export type HomeAction = {
  label: string;
  href: string;
  tone: "default" | "outline" | "secondary";
  onClick?: () => void;
};

type CanhoesEventHomeSnapshot = {
  event: EventSummaryDto;
  overview: EventOverviewDto;
  snapshot: EventHomeSnapshotDto;
};

export type CanhoesEventHomeViewModel = {
  event: EventSummaryDto;
  homeCopy: {
    alerts: string[];
    primaryAction: HomeAction;
    secondaryAction: HomeAction;
  };
  overview: EventOverviewDto;
  phaseDeadline: string | null;
  phaseLabel: string;
  phaseSummary: string;
  recentPosts: EventHomeSnapshotDto["recentPosts"];
  secretSanta: EventHomeSnapshotDto["secretSanta"];
  secretSantaAction: HomeAction;
  voting: EventHomeSnapshotDto["voting"];
  wishlistAction: HomeAction;
};

export function useCanhoesEventHome() {
  const { data: homeSnapshot, isLoading, error: snapshotError } = useQuery<CanhoesEventHomeSnapshot>({
    queryKey: ["canhoes", "home-snapshot", "active"],
    queryFn: async () => {
      const context = await canhoesEventsRepo.getActiveContext();
      const snapshot = await canhoesEventsRepo.getEventHomeSnapshot(context.event.id);
      return {
        event: context.event,
        overview: context.overview,
        snapshot,
      };
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const viewModel = useMemo(() => {
    if (!homeSnapshot) return null;

    const { event, overview, snapshot } = homeSnapshot;

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
      recentPosts: snapshot.recentPosts,
      secretSanta: snapshot.secretSanta,
      secretSantaAction: { label: "Abrir", href: "/canhoes", tone: "outline" as const },
      voting: snapshot.voting,
      wishlistAction: { label: "Abrir", href: "/canhoes", tone: "secondary" as const },
    } satisfies CanhoesEventHomeViewModel;
  }, [homeSnapshot]);

  const errorMessage = snapshotError instanceof Error ? snapshotError.message : null;

  return {
    errorMessage,
    isLoading,
    viewModel,
  };
}
