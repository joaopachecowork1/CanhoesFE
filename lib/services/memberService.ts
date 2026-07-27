import { prisma } from "@/lib/prisma";
import type {
  PublicUserDto,
  GalaMeasureDto,
  MeasureProposalDto,
  MyNominationStatusDto,
  NomineeDto,
  EventWishlistItemDto,
} from "@/lib/api/types";

type CanhoesCategoryResultDto = {
  categoryId: string;
  categoryName: string;
  totalVotes: number;
  top: Array<{
    nomineeId: string;
    categoryId: string | null;
    title: string;
    imageUrl: string | null;
    votes: number;
  }>;
};

type CanhoesResultNomineeDto = {
  nomineeId: string;
  categoryId: string | null;
  title: string;
  imageUrl: string | null;
  votes: number;
};

export async function getMembers(eventId: string): Promise<PublicUserDto[]> {
  const members = await prisma.eventMember.findMany({
    where: { eventId },
    orderBy: { role: "desc" },
  });

  const userIds = [...new Set(members.map((m) => m.userId))];
  const users = userIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true, displayName: true, isAdmin: true } })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  const result = members
    .map((m) => {
      const u = userMap.get(m.userId);
      return u ? { id: u.id, email: u.email, displayName: u.displayName, isAdmin: m.role === "admin" } : null;
    })
    .filter((x): x is PublicUserDto => x !== null)
    .sort((a, b) => {
      const roleCmp = (b.isAdmin ? 1 : 0) - (a.isAdmin ? 1 : 0);
      if (roleCmp !== 0) return roleCmp;
      return (a.displayName ?? a.email).localeCompare(b.displayName ?? b.email);
    });

  return result;
}

export async function getMeasures(eventId: string): Promise<GalaMeasureDto[]> {
  const measures = await prisma.galaMeasure.findMany({
    where: { eventId },
    orderBy: { createdAtUtc: "desc" },
  });

  return measures.map((m) => ({
    id: m.id,
    text: m.text,
    isActive: m.isActive,
    createdAtUtc: m.createdAtUtc.toISOString(),
  }));
}

export async function createMeasureProposal(
  eventId: string,
  userId: string,
  text: string
): Promise<MeasureProposalDto> {
  const proposal = await prisma.measureProposal.create({
    data: {
      eventId,
      proposedByUserId: userId,
      text,
      status: "pending",
    },
  });

  return {
    id: proposal.id,
    text: proposal.text,
    status: proposal.status as "pending" | "approved" | "rejected",
    createdAtUtc: proposal.createdAtUtc.toISOString(),
  };
}

export async function getResults(eventId: string): Promise<CanhoesCategoryResultDto[]> {
  const categories = await prisma.awardCategory.findMany({
    where: { eventId, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const userVoteCategories = categories.filter((c) => c.kind === 1);
  const nomineeCategories = categories.filter((c) => c.kind !== 1);

  const userVoteCategoryIds = userVoteCategories.map((c) => c.id);
  const nomineeCategoryIds = nomineeCategories.map((c) => c.id);

  const [userVotes, nomineeVotes, nominees] = await Promise.all([
    userVoteCategoryIds.length > 0
      ? prisma.userVote.findMany({ where: { eventId, categoryId: { in: userVoteCategoryIds } } })
      : Promise.resolve([]),
    nomineeCategoryIds.length > 0
      ? prisma.vote.findMany({ where: { eventId, categoryId: { in: nomineeCategoryIds } } })
      : Promise.resolve([]),
    nomineeCategoryIds.length > 0
      ? prisma.nominee.findMany({ where: { eventId, status: "approved" } })
      : Promise.resolve([]),
  ]);

  const nomineeMap = new Map(nominees.map((n) => [n.id, n]));

  const userVoteCounts = new Map<string, Map<string, number>>();
  for (const vote of userVotes) {
    const catMap = userVoteCounts.get(vote.categoryId) ?? new Map();
    catMap.set(vote.targetUserId, (catMap.get(vote.targetUserId) ?? 0) + 1);
    userVoteCounts.set(vote.categoryId, catMap);
  }

  const nomineeVoteCounts = new Map<string, Map<string, number>>();
  for (const vote of nomineeVotes) {
    const catMap = nomineeVoteCounts.get(vote.categoryId) ?? new Map();
    catMap.set(vote.nomineeId, (catMap.get(vote.nomineeId) ?? 0) + 1);
    nomineeVoteCounts.set(vote.categoryId, catMap);
  }

  return categories.map((cat) => {
    let voteMap: Map<string, number>;
    let titleLookup: (id: string) => string;

    if (cat.kind === 1) {
      voteMap = userVoteCounts.get(cat.id) ?? new Map();
      titleLookup = (userId: string) => userId;
    } else {
      voteMap = nomineeVoteCounts.get(cat.id) ?? new Map();
      titleLookup = (id: string) => nomineeMap.get(id)?.title ?? id;
    }

    const sortedEntries = [...voteMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const top: CanhoesResultNomineeDto[] = sortedEntries.map(([id, count]) => ({
      nomineeId: id,
      categoryId: cat.kind === 1 ? null : id,
      title: titleLookup(id),
      imageUrl: null,
      votes: count,
    }));

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      totalVotes: sortedEntries.reduce((sum, [, count]) => sum + count, 0),
      top,
    };
  });
}

export async function getMyNominationStatus(
  eventId: string,
  userId: string
): Promise<MyNominationStatusDto> {
  const nominee = await prisma.nominee.findFirst({
    where: { eventId, submittedByUserId: userId },
    orderBy: { createdAtUtc: "desc" },
  });

  if (!nominee) {
    return { hasNomination: false, categoryId: null, status: null, nomineeId: null, nomineeTitle: null };
  }

  return {
    hasNomination: true,
    categoryId: nominee.categoryId,
    status: nominee.status as "pending" | "approved" | "rejected",
    nomineeId: nominee.id,
    nomineeTitle: nominee.title,
  };
}

export async function getApprovedNominees(eventId: string): Promise<NomineeDto[]> {
  const nominees = await prisma.nominee.findMany({
    where: { eventId, status: "approved" },
    orderBy: { createdAtUtc: "desc" },
  });

  return nominees.map((n) => ({
    id: n.id,
    categoryId: n.categoryId,
    title: n.title,
    imageUrl: n.imageUrl,
    status: n.status as "pending" | "approved" | "rejected",
    createdAtUtc: n.createdAtUtc.toISOString(),
  }));
}

export async function createNomination(
  eventId: string,
  userId: string,
  data: { title: string; categoryId?: string | null; kind?: string | null; targetUserId?: string | null }
): Promise<NomineeDto> {
  const nominee = await prisma.nominee.create({
    data: {
      eventId,
      submittedByUserId: userId,
      title: data.title.trim(),
      categoryId: data.categoryId ?? null,
      submissionKind: data.kind?.trim().toLowerCase() === "stickers" ? "stickers" : "nominees",
      imageUrl: null,
      status: "pending",
    },
  });

  return {
    id: nominee.id,
    categoryId: nominee.categoryId,
    title: nominee.title,
    imageUrl: nominee.imageUrl,
    status: nominee.status as "pending" | "approved" | "rejected",
    createdAtUtc: nominee.createdAtUtc.toISOString(),
  };
}

export async function updateNomineeImage(
  eventId: string,
  nomineeId: string,
  userId: string,
  isAdmin: boolean,
  imageUrl: string
): Promise<NomineeDto | null> {
  const nominee = await prisma.nominee.findFirst({
    where: { id: nomineeId, eventId },
  });

  if (!nominee) return null;
  if (nominee.submittedByUserId !== userId && !isAdmin) return null;

  const updated = await prisma.nominee.update({
    where: { id: nomineeId },
    data: { imageUrl },
  });

  return {
    id: updated.id,
    categoryId: updated.categoryId,
    title: updated.title,
    imageUrl: updated.imageUrl,
    status: updated.status as "pending" | "approved" | "rejected",
    createdAtUtc: updated.createdAtUtc.toISOString(),
  };
}

export async function updateWishlistImage(
  eventId: string,
  itemId: string,
  userId: string,
  isAdmin: boolean,
  imageUrl: string
): Promise<EventWishlistItemDto | null> {
  const item = await prisma.wishlistItem.findFirst({
    where: { id: itemId, eventId },
  });

  if (!item) return null;
  if (item.userId !== userId && !isAdmin) return null;

  const updated = await prisma.wishlistItem.update({
    where: { id: itemId },
    data: { imageUrl },
  });

  return {
    id: updated.id,
    userId: updated.userId,
    eventId: updated.eventId,
    title: updated.title,
    url: updated.url,
    notes: updated.notes,
    imageUrl: updated.imageUrl,
    updatedAtUtc: updated.updatedAtUtc.toISOString(),
  };
}

export async function getWishlistItems(
  eventId: string,
  userId: string
): Promise<EventWishlistItemDto[]> {
  const items = await prisma.wishlistItem.findMany({
    where: { eventId, userId },
    orderBy: { createdAtUtc: "desc" },
  });

  return items.map((item) => ({
    id: item.id,
    userId: item.userId,
    eventId: item.eventId,
    title: item.title,
    url: item.url,
    notes: item.notes,
    imageUrl: item.imageUrl,
    updatedAtUtc: item.updatedAtUtc.toISOString(),
  }));
}

export async function createWishlistItem(
  eventId: string,
  userId: string,
  data: { title: string; url?: string | null; notes?: string | null }
): Promise<EventWishlistItemDto> {
  const item = await prisma.wishlistItem.create({
    data: {
      eventId,
      userId,
      title: data.title.trim(),
      url: data.url?.trim() ?? null,
      notes: data.notes?.trim() ?? null,
    },
  });

  return {
    id: item.id,
    userId: item.userId,
    eventId: item.eventId,
    title: item.title,
    url: item.url,
    notes: item.notes,
    imageUrl: item.imageUrl,
    updatedAtUtc: item.updatedAtUtc.toISOString(),
  };
}

export async function deleteWishlistItem(
  eventId: string,
  itemId: string,
  userId: string,
  isAdmin: boolean
): Promise<boolean> {
  const item = await prisma.wishlistItem.findFirst({
    where: { id: itemId, eventId },
  });

  if (!item) return false;
  if (item.userId !== userId && !isAdmin) return false;

  await prisma.wishlistItem.delete({ where: { id: itemId } });
  return true;
}
