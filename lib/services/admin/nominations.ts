import { prisma } from "@/lib/prisma";
import type {
  AdminNomineeDto,
  AdminNomineesPagedDto,
  NomineeSummaryDto,
  AdminNomineeSummaryDto,
} from "@/lib/api/types";

export async function setNominationCategory(
  eventId: string,
  nomineeId: string,
  categoryId?: string | null
): Promise<AdminNomineeDto | null> {
  const nominee = await prisma.nominee.findFirst({ where: { id: nomineeId, eventId } });
  if (!nominee) return null;

  const updated = await prisma.nominee.update({
    where: { id: nomineeId },
    data: { categoryId: categoryId ?? null },
  });

  const user = await prisma.user.findUnique({ where: { id: updated.submittedByUserId } });
  return {
    id: updated.id,
    categoryId: updated.categoryId,
    title: updated.title,
    imageUrl: updated.imageUrl,
    status: updated.status as "pending" | "approved" | "rejected",
    createdAtUtc: updated.createdAtUtc.toISOString(),
    submittedByUserId: updated.submittedByUserId,
    submittedByName: user?.displayName ?? user?.email ?? "Unknown",
  };
}

export async function approveNomination(eventId: string, nomineeId: string): Promise<AdminNomineeDto | null> {
  const nominee = await prisma.nominee.findFirst({ where: { id: nomineeId, eventId } });
  if (!nominee) return null;

  const updated = await prisma.nominee.update({
    where: { id: nomineeId },
    data: { status: "approved" },
  });

  const user = await prisma.user.findUnique({ where: { id: updated.submittedByUserId } });
  return {
    id: updated.id,
    categoryId: updated.categoryId,
    title: updated.title,
    imageUrl: updated.imageUrl,
    status: updated.status as "pending" | "approved" | "rejected",
    createdAtUtc: updated.createdAtUtc.toISOString(),
    submittedByUserId: updated.submittedByUserId,
    submittedByName: user?.displayName ?? user?.email ?? "Unknown",
  };
}

export async function rejectNomination(eventId: string, nomineeId: string): Promise<AdminNomineeDto | null> {
  const nominee = await prisma.nominee.findFirst({ where: { id: nomineeId, eventId } });
  if (!nominee) return null;

  const updated = await prisma.nominee.update({
    where: { id: nomineeId },
    data: { status: "rejected" },
  });

  const user = await prisma.user.findUnique({ where: { id: updated.submittedByUserId } });
  return {
    id: updated.id,
    categoryId: updated.categoryId,
    title: updated.title,
    imageUrl: updated.imageUrl,
    status: updated.status as "pending" | "approved" | "rejected",
    createdAtUtc: updated.createdAtUtc.toISOString(),
    submittedByUserId: updated.submittedByUserId,
    submittedByName: user?.displayName ?? user?.email ?? "Unknown",
  };
}

export async function getAdminNominationsPaged(
  eventId: string,
  status?: string | null,
  skip = 0,
  take = 50
): Promise<AdminNomineesPagedDto> {
  const where: Record<string, unknown> = { eventId };
  if (status) where.status = status;

  const [total, nominees] = await Promise.all([
    prisma.nominee.count({ where }),
    prisma.nominee.findMany({
      where,
      orderBy: { createdAtUtc: "desc" },
      skip,
      take,
    }),
  ]);

  const userIds = [...new Set(nominees.map((n) => n.submittedByUserId))];
  const users = userIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, displayName: true, email: true } })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  return {
    total,
    nominations: nominees.map((n) => {
      const u = userMap.get(n.submittedByUserId);
      return {
        id: n.id,
        categoryId: n.categoryId,
        title: n.title,
        imageUrl: n.imageUrl,
        status: n.status as "pending" | "approved" | "rejected",
        createdAtUtc: n.createdAtUtc.toISOString(),
        submittedByUserId: n.submittedByUserId,
        submittedByName: u?.displayName ?? u?.email ?? "Unknown",
      };
    }),
    skip, take,
    hasMore: skip + take < total,
  };
}

export async function getAdminNomineesSummary(eventId: string, status?: string | null): Promise<NomineeSummaryDto[]> {
  const where: Record<string, unknown> = { eventId };
  if (status) where.status = status;

  const raw = await prisma.nominee.findMany({
    where,
    orderBy: { createdAtUtc: "desc" },
    select: { id: true, categoryId: true, title: true, status: true },
  });

  return raw.map((n) => ({
    id: n.id,
    categoryId: n.categoryId,
    title: n.title,
    status: n.status as NomineeSummaryDto["status"],
  }));
}

export async function getAdminNominationsSummary(eventId: string, status?: string | null): Promise<AdminNomineeSummaryDto[]> {
  const where: Record<string, unknown> = { eventId };
  if (status) where.status = status;

  const nominees = await prisma.nominee.findMany({
    where,
    orderBy: { createdAtUtc: "desc" },
  });

  const userIds = [...new Set(nominees.map((n) => n.submittedByUserId))];
  const users = userIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, displayName: true, email: true } })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  return nominees.map((n) => {
    const u = userMap.get(n.submittedByUserId);
    return {
      id: n.id,
      categoryId: n.categoryId,
      title: n.title,
      status: n.status as "pending" | "approved" | "rejected",
      submittedByUserId: n.submittedByUserId,
      submittedByName: u?.displayName ?? u?.email ?? "Unknown",
    };
  });
}
