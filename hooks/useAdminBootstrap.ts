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

function flattenByStatus<T>(items?: ProposalsByStatusDto<T> | null) {
  if (!items) return [] as T[];
  return [...items.pending, ...items.approved, ...items.rejected];
}

/**
 * Loads all admin data for an event in a single request.
 * This is the single source of truth for admin state.
 * 
 * Returns event state, categories, nominees, proposals, votes, members, etc.
 * Data is cached for 5 minutes to avoid unnecessary refetches.
 */
export function useAdminBootstrap(eventId: string | null) {
  const bootstrapQuery = useQuery<EventAdminBootstrapDto>({
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.getAdminBootstrap(eventId!),
    queryKey: ["canhoes", "admin-bootstrap", eventId],
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const bootstrap = bootstrapQuery.data ?? null;
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
  const officialResults: AdminOfficialResultsDto | undefined = bootstrap?.officialResults;
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
      adminNominees.length > 0
        ? adminNominees.filter((nominee) => nominee.status === "pending").length
        : pendingNominees.length,
    [adminNominees, pendingNominees]
  );

  const summary = useMemo(
    () => ({
      memberCount: members.length,
      pendingCategoryProposalCount: pendingCategoryProposals.length,
      pendingMeasureProposalCount: pendingMeasureProposals.length,
      pendingNominationCount,
      totalCategories: categories.length,
      totalNominees: allNominees.length,
      visibleModuleCount: countVisibleModules(state?.effectiveModules),
    }),
    [
      allNominees.length,
      categories.length,
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
    allCategoryProposals,
    allMeasureProposals,
    allNominees,
    adminNominees,
    bootstrap,
    categories,
    error: bootstrapQuery.error ?? null,
    events,
    loading: Boolean(eventId) && (bootstrapQuery.isLoading || (bootstrapQuery.isFetching && !bootstrap)),
    members,
    officialResults,
    pendingCategoryProposals,
    pendingMeasureProposals,
    pendingNominationCount,
    pendingNominees,
    secretSanta,
    summary,
    state,
    votes,
    refresh,
  };
}
