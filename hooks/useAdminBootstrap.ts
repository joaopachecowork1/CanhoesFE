"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type {
  AdminNomineeDto,
  AdminOfficialResultsDto,
  AdminVoteAuditRowDto,
  AwardCategoryDto,
  CategoryProposalDto,
  EventAdminBootstrapDto,
  EventAdminSecretSantaStateDto,
  EventAdminStateDto,
  EventSummaryDto,
  MeasureProposalDto,
  NomineeDto,
  ProposalsByStatusDto,
  PublicUserDto,
} from "@/lib/api/types";
import { countVisibleModules } from "@/lib/modules";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

function flattenByStatus<T>(items?: ProposalsByStatusDto<T> | null | undefined) {
  if (!items) return [] as T[];
  return [...items.pending, ...items.approved, ...items.rejected];
}

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
    queryKey: ["canhoes", "admin-bootstrap", eventId],
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const bootstrap = bootstrapQuery.data ?? null;
  const counts = bootstrap?.counts ?? null;
  const proposals = bootstrap?.proposals ?? null;
  const voteAudit = bootstrap?.votes ?? null;
  const state: EventAdminStateDto | null = bootstrap?.state ?? null;
  const events: EventSummaryDto[] = bootstrap?.events ?? [];
  const categories: AwardCategoryDto[] = bootstrap?.categories ?? [];
  const allNominees = useMemo<NomineeDto[]>(
    () => bootstrap?.nominees ?? [],
    [bootstrap?.nominees]
  );
  const adminNominees = useMemo<AdminNomineeDto[]>(
    () => bootstrap?.adminNominees ?? [],
    [bootstrap?.adminNominees]
  );
  const officialResults: AdminOfficialResultsDto | undefined = bootstrap?.officialResults ?? undefined;
  const votes: AdminVoteAuditRowDto[] = voteAudit?.votes ?? [];
  const members: PublicUserDto[] = bootstrap?.members ?? [];
  const secretSanta: EventAdminSecretSantaStateDto | null = bootstrap?.secretSanta ?? null;

  const allCategoryProposals = useMemo<CategoryProposalDto[]>(
    () => flattenByStatus(proposals?.categoryProposals),
    [proposals]
  );

  const allMeasureProposals = useMemo<MeasureProposalDto[]>(
    () => flattenByStatus(proposals?.measureProposals),
    [proposals]
  );

  const pendingCategoryProposals = useMemo(
    () => allCategoryProposals.filter((proposal) => proposal.status === "pending"),
    [allCategoryProposals]
  );

  const pendingMeasureProposals = useMemo(
    () => allMeasureProposals.filter((proposal) => proposal.status === "pending"),
    [allMeasureProposals]
  );

  const pendingNominees = useMemo(
    () => allNominees.filter((nominee) => nominee.status === "pending"),
    [allNominees]
  );

  const pendingNominationCount = useMemo(
    () =>
      counts?.adminNomineesTotal ??
      (adminNominees.length > 0
        ? adminNominees.filter((nominee) => nominee.status === "pending").length
        : pendingNominees.length),
    [counts?.adminNomineesTotal, adminNominees, pendingNominees]
  );

  const summary = useMemo(
    () => ({
      memberCount: counts?.membersTotal ?? members.length,
      pendingCategoryProposalCount: counts?.categoryProposalsPendingTotal ?? pendingCategoryProposals.length,
      pendingMeasureProposalCount: counts?.measureProposalsPendingTotal ?? pendingMeasureProposals.length,
      pendingNominationCount,
      totalCategories: bootstrap?.categories?.length ?? 0,
      totalNominees: counts?.nomineesTotal ?? allNominees.length,
      visibleModuleCount: countVisibleModules(state?.effectiveModules),
    }),
    [
      counts?.membersTotal,
      counts?.categoryProposalsPendingTotal,
      counts?.measureProposalsPendingTotal,
      counts?.nomineesTotal,
      bootstrap?.categories?.length,
      allNominees.length,
      members.length,
      pendingCategoryProposals.length,
      pendingMeasureProposals.length,
      pendingNominationCount,
      state?.effectiveModules,
    ]
  );

  const refresh = useCallback(async () => {
    await bootstrapQuery.refetch();
  }, [bootstrapQuery]);

  return {
    allNominees,
    adminNominees,
    categories,
    error: bootstrapQuery.error ?? null,
    events,
    loading: Boolean(eventId) && (bootstrapQuery.isLoading || (bootstrapQuery.isFetching && !bootstrap)),
    members,
    officialResults,
    pendingCategoryProposals,
    pendingMeasureProposals,
    pendingNominees,
    secretSanta,
    summary,
    state,
    votes,
    refresh,
  };
}
