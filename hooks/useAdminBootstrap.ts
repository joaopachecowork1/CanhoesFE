"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import type {
  EventAdminBootstrapDto,
  EventAdminStateDto,
  EventSummaryDto,
} from "@/lib/api/types";
import { countVisibleModules } from "@/lib/modules";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

/**
 * Loads admin bootstrap data — now lightweight by default.
 * Returns counts only (not full lists) so the admin panel loads fast.
 * Lists are loaded lazily per section via dedicated paginated queries.
 *
 * Data is cached for 5 minutes to avoid unnecessary refetches.
 */
export function useAdminBootstrap(eventId: string | null) {
  const bootstrapQuery = useQuery<EventAdminBootstrapDto>({
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.getAdminBootstrap(eventId!, false /* includeLists */),
    queryKey: ["canhoes", "admin", "bootstrap", eventId],
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const bootstrap = bootstrapQuery.data ?? null;
  const state: EventAdminStateDto | null = bootstrap?.adminState ?? null;
  const events: EventSummaryDto[] = bootstrap ? [bootstrap.event] : [];

  const summary = {
    memberCount: state?.counts.memberCount ?? 0,
    pendingCategoryProposalCount: 0,
    pendingMeasureProposalCount: 0,
    pendingNominationCount: 0,
    officialResultsCategoryCount: 0,
    totalCategories: state?.counts.categoryCount ?? 0,
    totalNominees: 0,
    visibleModuleCount: countVisibleModules(state?.effectiveModules),
  };

  const refresh = useCallback(async () => {
    await bootstrapQuery.refetch();
  }, [bootstrapQuery]);

  return {
    error: bootstrapQuery.error ?? null,
    events,
    loading: Boolean(eventId) && (bootstrapQuery.isLoading || (bootstrapQuery.isFetching && !bootstrap)),
    summary,
    state,
    refresh,
  };
}
