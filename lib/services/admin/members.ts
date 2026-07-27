import { prisma } from "@/lib/prisma";
import type { PagedResult, PublicUserDto } from "@/lib/api/types";

export async function getAdminMembersPaged(
  eventId: string,
  skip = 0,
  take = 50
): Promise<PagedResult<PublicUserDto>> {
  const total = await prisma.eventMember.count({ where: { eventId } });

  const members = await prisma.eventMember.findMany({
    where: { eventId },
    orderBy: { role: "desc" },
    skip, take,
  });

  const userIds = [...new Set(members.map((m) => m.userId))];
  const users = userIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true, displayName: true, isAdmin: true } })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  const items = members
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

  return {
    items,
    total, skip, take,
    hasMore: skip + take < total,
  };
}
