import { prisma } from "@/lib/prisma";
import type {
  EventSummaryDto,
  EventContextDto,
  EventOverviewDto,
  EventPhaseDto,
  EventPermissionsDto,
  EventModulesDto,
  EventActiveContextDto,
} from "@/lib/api/types";

function toEventSummary(event: { id: string; name: string; isActive: boolean }): EventSummaryDto {
  return { id: event.id, name: event.name, isActive: event.isActive };
}

function toPhaseDto(phase: {
  id: string; type: string; startDateUtc: Date; endDateUtc: Date; isActive: boolean;
}): EventPhaseDto {
  return {
    id: phase.id,
    type: phase.type,
    startDateUtc: phase.startDateUtc.toISOString(),
    endDateUtc: phase.endDateUtc.toISOString(),
    isActive: phase.isActive,
  };
}

export async function getEventSummaries(): Promise<EventSummaryDto[]> {
  const events = await prisma.event.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
  return events.map(toEventSummary);
}

export async function getEventById(eventId: string) {
  return prisma.event.findUnique({ where: { id: eventId } });
}

export async function getEventContext(
  eventId: string,
  _userId: string,
  _isAdmin: boolean
): Promise<EventContextDto | null> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return null;

  const [phases, members] = await Promise.all([
    prisma.eventPhase.findMany({ where: { eventId }, orderBy: { startDateUtc: "asc" } }),
    prisma.eventMember.findMany({ where: { eventId } }),
  ]);
  const memberUserIds = [...new Set(members.map((member) => member.userId))];
  const memberUsers = memberUserIds.length
    ? await prisma.user.findMany({
        where: { id: { in: memberUserIds } },
        select: { id: true, displayName: true, email: true },
      })
    : [];
  const usersById = new Map(memberUsers.map((user) => [user.id, user]));
  const activePhase = phases.find((phase) => phase.isActive) ?? null;

  return {
    event: toEventSummary(event),
    users: members.map((member) => {
      const user = usersById.get(member.userId);
      return {
        id: member.userId,
        name: user?.displayName ?? user?.email ?? "Unknown",
        role: member.role,
      };
    }),
    phases: phases.map(toPhaseDto),
    activePhase: activePhase ? toPhaseDto(activePhase) : null,
  };
}

export async function getEventOverview(
  eventId: string,
  userId: string,
  isAdmin: boolean
): Promise<EventOverviewDto | null> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return null;

  const [phases, member, state] = await Promise.all([
    prisma.eventPhase.findMany({ where: { eventId }, orderBy: { startDateUtc: "asc" } }),
    prisma.eventMember.findFirst({ where: { eventId, userId } }),
    prisma.canhoesEventState.findUnique({ where: { eventId } }),
  ]);
  const activePhase = phases.find((phase) => phase.isActive) ?? null;
  const activePhaseIndex = phases.findIndex((phase) => phase.isActive);
  const nextPhase = activePhaseIndex >= 0 ? phases[activePhaseIndex + 1] ?? null : null;

  const permissions: EventPermissionsDto = {
    isAdmin,
    isMember: Boolean(member),
    canPost: isAdmin || Boolean(member),
    canSubmitProposal: isAdmin || (Boolean(member) && (state?.nominationsVisible ?? true)),
    canVote: isAdmin || (Boolean(member) && activePhase?.type === "VOTING"),
    canManage: isAdmin,
  };
  const [memberCount, feedPostCount, pendingProposalCount, wishlistItemCount] = await Promise.all([
    prisma.eventMember.count({ where: { eventId } }),
    prisma.hubPost.count({ where: { eventId } }),
    prisma.categoryProposal.count({ where: { eventId, status: "pending" } }),
    prisma.wishlistItem.count({ where: { eventId, userId } }),
  ]);
  const visibility = (state?.moduleVisibilityJson ?? {}) as Record<string, boolean>;
  const isProposalPhase = activePhase?.type === "PROPOSALS";
  const isVotingPhase = activePhase?.type === "VOTING";
  const isResultsPhase = activePhase?.type === "RESULTS";
  const isDrawPhase = activePhase?.type === "DRAW";
  const modules: EventModulesDto = isAdmin
    ? { feed: true, secretSanta: true, wishlist: true, categories: true, voting: true, gala: true, stickers: true, measures: true, nominees: true, admin: true }
    : {
        feed: visibility.feed ?? true,
        secretSanta: (visibility.secretSanta ?? true) && (isDrawPhase || Boolean(state?.hasSecretSantaDraw) || isVotingPhase || isResultsPhase),
        wishlist: visibility.wishlist ?? true,
        categories: (visibility.categories ?? true) && (isProposalPhase || isVotingPhase || isResultsPhase),
        voting: (visibility.voting ?? true) && isVotingPhase,
        gala: (visibility.gala ?? true) && isResultsPhase,
        stickers: (visibility.stickers ?? true) && isProposalPhase && (state?.nominationsVisible ?? true),
        measures: (visibility.measures ?? true) && isProposalPhase && (state?.nominationsVisible ?? true),
        nominees: (visibility.nominees ?? true) && ((state?.nominationsVisible ?? false) || isResultsPhase),
        admin: false,
      };

  return {
    event: toEventSummary(event),
    activePhase: activePhase ? toPhaseDto(activePhase) : null,
    nextPhase: nextPhase ? toPhaseDto(nextPhase) : null,
    permissions,
    counts: { memberCount, feedPostCount, categoryCount: 0, pendingProposalCount, wishlistItemCount },
    hasSecretSantaDraw: state?.hasSecretSantaDraw ?? false,
    hasSecretSantaAssignment: false,
    myWishlistItemCount: wishlistItemCount,
    myProposalCount: 0,
    myVoteCount: 0,
    votingCategoryCount: 0,
    modules,
  };
}

export async function getActiveEventContext(
  userId: string,
  isAdmin: boolean
): Promise<EventActiveContextDto | null> {
  const activeEvent = await prisma.event.findFirst({
    where: { isActive: true },
    orderBy: { createdAtUtc: "desc" },
  });
  if (!activeEvent) return null;
  const overview = await getEventOverview(activeEvent.id, userId, isAdmin);
  return overview ? { event: toEventSummary(activeEvent), overview } : null;
}
