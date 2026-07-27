import { prisma } from "@/lib/prisma";
import type {
  EventSummaryDto,
  EventContextDto,
  EventOverviewDto,
  EventPhaseDto,
  EventPermissionsDto,
  EventModulesDto,
  EventActiveContextDto,
  EventHomeSnapshotDto,
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
  return prisma.event.findUnique({
    where: { id: eventId },
  });
}

export async function getEventContext(
  eventId: string,
  _userId: string,
  _isAdmin: boolean
): Promise<EventContextDto | null> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!event) return null;

  const [phases, members] = await Promise.all([
    prisma.eventPhase.findMany({
      where: { eventId },
      orderBy: { startDateUtc: "asc" },
    }),
    prisma.eventMember.findMany({
      where: { eventId },
    }),
  ]);

  const memberUserIds = [...new Set(members.map((m) => m.userId))];
  const memberUsers = memberUserIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: memberUserIds } }, select: { id: true, displayName: true, email: true } })
    : [];
  const memberUserMap = new Map(memberUsers.map((u) => [u.id, u]));

  const activePhase = phases.find((p) => p.isActive) ?? null;

  return {
    event: toEventSummary(event),
    users: members.map((m) => {
      const u = memberUserMap.get(m.userId);
      return {
        id: m.userId,
        name: u?.displayName ?? u?.email ?? "Unknown",
        role: m.role,
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

  const activePhase = phases.find((p) => p.isActive) ?? null;
  const activePhaseIdx = phases.findIndex((p) => p.isActive);
  const nextIdx = activePhaseIdx >= 0 && activePhaseIdx < phases.length - 1 ? activePhaseIdx + 1 : -1;
  const next = nextIdx >= 0 ? phases[nextIdx] : null;

  const permissions: EventPermissionsDto = {
    isAdmin,
    isMember: !!member,
    canPost: isAdmin || !!member,
    canSubmitProposal: isAdmin || (!!member && (state?.nominationsVisible ?? true)),
    canVote: isAdmin || (!!member && activePhase?.type === "VOTING"),
    canManage: isAdmin,
  };

  const [memberCount, hubPostCount, pendingProposalsCount, wishlistCount] = await Promise.all([
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
        secretSanta: (visibility.secretSanta ?? true) && (isDrawPhase || !!state?.hasSecretSantaDraw || isVotingPhase || isResultsPhase),
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
    nextPhase: next ? toPhaseDto(next) : null,
    permissions,
    counts: {
      memberCount,
      feedPostCount: hubPostCount,
      categoryCount: 0,
      pendingProposalCount: pendingProposalsCount,
      wishlistItemCount: wishlistCount,
    },
    hasSecretSantaDraw: state?.hasSecretSantaDraw ?? false,
    hasSecretSantaAssignment: false,
    myWishlistItemCount: wishlistCount,
    myProposalCount: 0,
    myVoteCount: 0,
    votingCategoryCount: 0,
    modules,
  };
}

export async function getActiveEventContext(
  userId: string, isAdmin: boolean
): Promise<EventActiveContextDto | null> {
  const activeEvent = await prisma.event.findFirst({
    where: { isActive: true },
    orderBy: { createdAtUtc: "desc" },
  });
  if (!activeEvent) return null;

  const overview = await getEventOverview(activeEvent.id, userId, isAdmin);
  if (!overview) return null;

  return { event: toEventSummary(activeEvent), overview };
}

export async function getHomeSnapshot(
  userId: string,
  isAdmin: boolean
): Promise<EventHomeSnapshotDto | null> {
  const activeEvent = await prisma.event.findFirst({
    where: { isActive: true },
    orderBy: { createdAtUtc: "desc" },
  });
  if (!activeEvent) return null;

  const overview = await getEventOverview(activeEvent.id, userId, isAdmin);
  if (!overview) return null;

  const votingOverview = await getVotingOverview(activeEvent.id, userId);
  const secretSantaOverview = await getSsOverview(activeEvent.id, userId);
  const recentPosts = await getRecentPosts(activeEvent.id, userId);

  return {
    event: toEventSummary(activeEvent),
    overview,
    voting: votingOverview,
    secretSanta: secretSantaOverview,
    recentPosts,
  };
}

async function getVotingOverview(eventId: string, userId: string) {
  const votingPhase = await prisma.eventPhase.findFirst({
    where: { eventId, type: "VOTING", isActive: true },
  });

  const categories = await prisma.awardCategory.findMany({
    where: { eventId, isActive: true },
  });

  const categoryIds = categories.map((c) => c.id);
  const [nomineeVotesCount, userVotesCount] = await Promise.all([
    categoryIds.length > 0
      ? prisma.vote.count({ where: { eventId, userId, categoryId: { in: categoryIds } } })
      : Promise.resolve(0),
    categoryIds.length > 0
      ? prisma.userVote.count({ where: { eventId, voterUserId: userId, categoryId: { in: categoryIds } } })
      : Promise.resolve(0),
  ]);

  const submittedVoteCount = nomineeVotesCount + userVotesCount;
  const now = new Date();
  const canVote = votingPhase ? now >= votingPhase.startDateUtc && now <= votingPhase.endDateUtc : false;

  return {
    eventId,
    phaseId: votingPhase?.id ?? null,
    canVote,
    endsAtUtc: votingPhase?.endDateUtc.toISOString() ?? null,
    categoryCount: categories.length,
    submittedVoteCount,
    remainingVoteCount: Math.max(0, categories.length - submittedVoteCount),
  };
}

async function getSsOverview(eventId: string, userId: string) {
  const state = await prisma.canhoesEventState.findUnique({ where: { eventId } });
  const eventCode = state?.secretSantaEventCode ?? eventId;

  const latestDraw = await prisma.secretSantaDraw.findFirst({
    where: { eventCode },
    orderBy: { createdAtUtc: "desc" },
  });

  if (!latestDraw) {
    return {
      eventId,
      hasDraw: false,
      hasAssignment: false,
      drawEventCode: null,
      assignedUser: null,
      assignedWishlistItemCount: 0,
      myWishlistItemCount: await prisma.wishlistItem.count({ where: { eventId, userId } }),
    };
  }

  const assignment = await prisma.secretSantaAssignment.findFirst({
    where: { drawId: latestDraw.id, giverUserId: userId },
  });

  let assignedUser = null;
  let assignedWishlistItemCount = 0;

  if (assignment) {
    const targetUser = await prisma.user.findUnique({
      where: { id: assignment.receiverUserId },
      select: { id: true, displayName: true, email: true },
    });
    if (targetUser) {
      assignedUser = { id: targetUser.id, name: targetUser.displayName ?? targetUser.email, role: "user" };
    }
    assignedWishlistItemCount = await prisma.wishlistItem.count({
      where: { eventId, userId: assignment.receiverUserId },
    });
  }

  return {
    eventId,
    hasDraw: true,
    hasAssignment: !!assignment,
    drawEventCode: latestDraw.eventCode,
    assignedUser,
    assignedWishlistItemCount,
    myWishlistItemCount: await prisma.wishlistItem.count({ where: { eventId, userId } }),
  };
}

async function getRecentPosts(eventId: string, userId: string, take = 5) {
  const posts = await prisma.hubPost.findMany({
    where: { eventId },
    orderBy: { createdAtUtc: "desc" },
    take,
    select: {
      id: true, eventId: true, authorUserId: true, text: true,
      mediaUrl: true, mediaUrlsJson: true, isPinned: true, createdAtUtc: true,
    },
  });

  return Promise.all(posts.map((post) => enrichFeedPost(post, userId)));
}

async function enrichFeedPost(
  post: {
    id: string; eventId: string; authorUserId: string; text: string;
    mediaUrl: string | null; mediaUrlsJson: unknown; isPinned: boolean; createdAtUtc: Date;
  },
  userId: string
) {
  const author = await prisma.user.findUnique({
    where: { id: post.authorUserId },
    select: { displayName: true },
  });

  const [downvotes, commentCount, likeCount, reactions, poll] = await Promise.all([
    prisma.hubPostDownvote.count({ where: { postId: post.id } }),
    prisma.hubPostComment.count({ where: { postId: post.id } }),
    prisma.hubPostReaction.count({ where: { postId: post.id, emoji: "heart" } }),
    prisma.hubPostReaction.findMany({ where: { postId: post.id }, select: { userId: true, emoji: true } }),
    prisma.hubPostPoll.findUnique({
      where: { postId: post.id },
      include: {
        options: true,
        votes: { where: { userId } },
      },
    }),
  ]);

  const reactionCounts: Record<string, number> = {};
  const myReactions: string[] = [];
  for (const r of reactions) {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] ?? 0) + 1;
    if (r.userId === userId) myReactions.push(r.emoji);
  }

  const allPollVotes = poll ? await prisma.hubPostPollVote.groupBy({
    by: ["optionId"],
    where: { postId: post.id },
    _count: true,
  }) : [];

  const pollVoteCountMap = new Map(allPollVotes.map((v) => [v.optionId, v._count]));
  const totalPollVotes = allPollVotes.reduce((sum, v) => sum + v._count, 0);

  return {
    id: post.id,
    eventId: post.eventId,
    authorUserId: post.authorUserId,
    authorName: author?.displayName ?? "Unknown",
    text: post.text,
    mediaUrl: post.mediaUrl,
    mediaUrls: Array.isArray(post.mediaUrlsJson) ? post.mediaUrlsJson as string[] : [],
    isPinned: post.isPinned,
    createdAtUtc: post.createdAtUtc.toISOString(),
    likeCount,
    commentCount,
    downvoteCount: downvotes,
    reactionCounts,
    myReactions,
    likedByMe: myReactions.includes("heart"),
    downvotedByMe: false,
    poll: poll ? {
      question: poll.question,
      totalVotes: totalPollVotes,
      myOptionId: poll.votes[0]?.optionId ?? null,
      options: poll.options.map((o) => ({
        id: o.id,
        text: o.text,
        voteCount: pollVoteCountMap.get(o.id) ?? 0,
      })),
    } : null,
  };
}
