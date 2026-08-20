import { prisma } from "@/lib/prisma";
import type {
  EventVotingOverviewDto,
  EventVotingBoardDto,
  EventVotingCategoryDto,
  EventVoteOptionDto,
  EventProposalDto,
  PagedResult,
} from "@/lib/api/types";

type EventVoteDto = {
  categoryId: string;
  selectionId: string;
};

export async function getVotingOverview(
  eventId: string,
  userId: string
): Promise<EventVotingOverviewDto> {
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
  const isOpen = votingPhase ? now >= votingPhase.startDateUtc && now <= votingPhase.endDateUtc : false;

  return {
    eventId,
    phaseId: votingPhase?.id ?? null,
    canVote: isOpen,
    endsAtUtc: votingPhase?.endDateUtc.toISOString() ?? null,
    categoryCount: categories.length,
    submittedVoteCount,
    remainingVoteCount: Math.max(0, categories.length - submittedVoteCount),
  };
}

export async function getVotingBoard(
  eventId: string,
  userId: string
): Promise<EventVotingBoardDto | null> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return null;

  const votingPhase = await prisma.eventPhase.findFirst({
    where: { eventId, type: "VOTING", isActive: true },
  });

  const categories = await prisma.awardCategory.findMany({
    where: { eventId, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const nominees = await prisma.nominee.findMany({
    where: { eventId, status: "approved" },
  });

  const members = await prisma.eventMember.findMany({
    where: { eventId },
  });

  const memberUserIds = [...new Set(members.map((m) => m.userId))];
  const memberUsers = memberUserIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: memberUserIds } }, select: { id: true, displayName: true, email: true } })
    : [];
  const memberUserMap = new Map(memberUsers.map((u) => [u.id, u]));

  const [nomineeVotes, userVotes] = await Promise.all([
    categoryIds(categories).length > 0
      ? prisma.vote.findMany({
          where: { eventId, userId, categoryId: { in: categoryIds(categories) } },
          select: { categoryId: true, nomineeId: true },
        })
      : Promise.resolve([]),
    categoryIds(categories).length > 0
      ? prisma.userVote.findMany({
          where: { eventId, voterUserId: userId, categoryId: { in: categoryIds(categories) } },
          select: { categoryId: true, targetUserId: true },
        })
      : Promise.resolve([]),
  ]);

  const nomineeVoteMap = new Map(nomineeVotes.map((v) => [v.categoryId, v.nomineeId]));
  const userVoteMap = new Map(userVotes.map((v) => [v.categoryId, v.targetUserId]));

  const categoriesDto: EventVotingCategoryDto[] = categories.map((cat) => {
    let options: EventVoteOptionDto[];
    let mySelectionId: string | null = null;

    if (cat.kind === 1) {
      options = members
        .filter((m) => m.role !== "admin")
        .sort((a, b) => {
          const uA = memberUserMap.get(a.userId);
          const uB = memberUserMap.get(b.userId);
          return (uA?.displayName ?? uA?.email ?? "").localeCompare(uB?.displayName ?? uB?.email ?? "");
        })
        .map((m) => {
          const u = memberUserMap.get(m.userId);
          return {
            id: m.userId,
            label: u?.displayName ?? u?.email ?? "Unknown",
            imageUrl: null,
          };
        });

      const targetId = userVoteMap.get(cat.id);
      mySelectionId = targetId ?? null;
    } else {
      options = nominees
        .filter((n) => n.categoryId === cat.id)
        .map((n) => ({
          id: n.id,
          label: n.title,
          imageUrl: null,
        }));

      const nomId = nomineeVoteMap.get(cat.id);
      mySelectionId = nomId ?? null;
    }

    return {
      id: cat.id,
      title: cat.name,
      kind: cat.kind,
      description: cat.description,
      voteQuestion: cat.voteQuestion,
      options,
      myOptionId: mySelectionId,
    };
  });

  const now = new Date();
  const canVote = votingPhase ? now >= votingPhase.startDateUtc && now <= votingPhase.endDateUtc : false;

  return {
    eventId,
    phaseId: votingPhase?.id ?? null,
    canVote,
    categories: categoriesDto,
  };
}

function categoryIds(categories: { id: string }[]): string[] {
  return categories.map((c) => c.id);
}

export async function castVote(
  eventId: string,
  userId: string,
  categoryId: string,
  selectionId: string
): Promise<EventVoteDto | null> {
  const category = await prisma.awardCategory.findFirst({
    where: { id: categoryId, eventId, isActive: true },
  });
  if (!category) return null;

  if (category.kind === 1) {
    const existing = await prisma.userVote.findFirst({
      where: { eventId, categoryId, voterUserId: userId },
    });

    if (existing) {
      await prisma.userVote.update({
        where: { id: existing.id },
        data: { targetUserId: selectionId },
      });
    } else {
      await prisma.userVote.create({
        data: { eventId, categoryId, voterUserId: userId, targetUserId: selectionId },
      });
    }
  } else {
    const existing = await prisma.vote.findFirst({
      where: { eventId, categoryId, userId },
    });

    if (existing) {
      await prisma.vote.update({
        where: { id: existing.id },
        data: { nomineeId: selectionId },
      });
    } else {
      await prisma.vote.create({
        data: { eventId, categoryId, userId, nomineeId: selectionId },
      });
    }
  }

  return { categoryId, selectionId };
}

export async function getProposals(
  eventId: string,
  skip: number,
  take: number
): Promise<PagedResult<EventProposalDto>> {
  const where = { eventId };

  const [items, total] = await Promise.all([
    prisma.categoryProposal.findMany({
      where,
      orderBy: { createdAtUtc: "desc" },
      skip,
      take,
    }),
    prisma.categoryProposal.count({ where }),
  ]);

  return {
    items: items.map((p) => ({
      id: p.id,
      eventId: p.eventId,
      userId: p.proposedByUserId,
      name: p.name,
      description: p.description,
      status: p.status,
      createdAt: p.createdAtUtc.toISOString(),
    })),
    total,
    skip,
    take,
    hasMore: skip + take < total,
  };
}

export async function createProposal(
  eventId: string,
  userId: string,
  name: string,
  description?: string | null
): Promise<EventProposalDto> {
  const proposal = await prisma.categoryProposal.create({
    data: {
      eventId,
      proposedByUserId: userId,
      name: name.trim(),
      description: description?.trim() ?? null,
      status: "pending",
    },
  });

  return {
    id: proposal.id,
    eventId: proposal.eventId,
    userId: proposal.proposedByUserId,
    name: proposal.name,
    description: proposal.description,
    status: proposal.status,
    createdAt: proposal.createdAtUtc.toISOString(),
  };
}
