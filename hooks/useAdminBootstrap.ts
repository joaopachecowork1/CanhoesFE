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
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

function flattenByStatus<T>(items?: ProposalsByStatusDto<T> | null) {
  if (!items) return [] as T[];
  return [...items.pending, ...items.approved, ...items.rejected];
}

/**
 * Hydrates the admin control center from a single event-scoped contract so the
 * admin shell does not have to coordinate multiple bootstrap requests.
 */
export function useAdminBootstrap(eventId: string | null) {
  const query = useQuery<EventAdminBootstrapDto>({
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.getAdminBootstrap(eventId!),
    queryKey: ["canhoes", "admin-bootstrap", eventId],
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const bootstrap = query.data ?? null;
  const state: EventAdminStateDto | null = bootstrap?.state ?? null;
  const events: EventSummaryDto[] = bootstrap?.events ?? [];
  const categories: AwardCategoryDto[] = bootstrap?.categories ?? [];
  const allNominees: NomineeDto[] = bootstrap?.nominees ?? [];
  const adminNominees: AdminNomineeDto[] = bootstrap?.adminNominees ?? [];
  const officialResults: AdminOfficialResultsDto | undefined = bootstrap?.officialResults;
  const votes: AdminVoteAuditRowDto[] = bootstrap?.votes.votes ?? [];
  const members: PublicUserDto[] = bootstrap?.members ?? [];
  const secretSanta: EventAdminSecretSantaStateDto | null = bootstrap?.secretSanta ?? null;

  const allCategoryProposals = useMemo<CategoryProposalDto[]>(
    () => flattenByStatus(bootstrap?.proposals.categoryProposals),
    [bootstrap]
  );

  const allMeasureProposals = useMemo<MeasureProposalDto[]>(
    () => flattenByStatus(bootstrap?.proposals.measureProposals),
    [bootstrap]
  );

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return {
    allCategoryProposals,
    allMeasureProposals,
    allNominees,
    adminNominees,
    bootstrap,
    categories,
    error: query.error ?? null,
    events,
    loading: Boolean(eventId) && (query.isLoading || (query.isFetching && !bootstrap)),
    members,
    officialResults,
    secretSanta,
    state,
    votes,
    refresh,
  };
}
