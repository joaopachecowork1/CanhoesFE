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

type CanhoesEventHomeContext = {
  event: EventSummaryDto;
  overview: EventOverviewDto;
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
  const activeContextQuery = useQuery<CanhoesEventHomeContext>({
    queryKey: ["canhoes", "home", "active-context"],
    queryFn: async () => {
      const context = await canhoesEventsRepo.getActiveContext();
      return {
        event: context.event,
        overview: context.overview,
      };
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const eventId = activeContextQuery.data?.event.id ?? null;

  const snapshotQuery = useQuery<EventHomeSnapshotDto>({
    enabled: Boolean(eventId),
    queryKey: ["canhoes", "home-snapshot", eventId],
    queryFn: () => canhoesEventsRepo.getEventHomeSnapshot(eventId!),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const viewModel = useMemo(() => {
    if (!activeContextQuery.data || !snapshotQuery.data) return null;

    const { event, overview } = activeContextQuery.data;
    const snapshot = snapshotQuery.data;

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
  }, [activeContextQuery.data, snapshotQuery.data]);

  const error = activeContextQuery.error ?? snapshotQuery.error;
  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null;

  return {
    errorMessage,
    isLoading: activeContextQuery.isLoading || snapshotQuery.isLoading,
    viewModel,
  };
}
