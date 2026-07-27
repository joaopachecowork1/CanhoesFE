import { prisma } from "@/lib/prisma";
import type { EventSecretSantaOverviewDto, EventUserDto } from "@/lib/api/types";

export async function getOverview(
  eventId: string,
  userId: string
): Promise<EventSecretSantaOverviewDto> {
  const eventCode = await getEventCode(eventId);

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
      myWishlistItemCount: await countMyWishlistItems(eventId, userId),
    };
  }

  const assignment = await prisma.secretSantaAssignment.findFirst({
    where: { drawId: latestDraw.id, giverUserId: userId },
  });

  let assignedUser: EventUserDto | null = null;
  let assignedWishlistItemCount = 0;

  if (assignment) {
    const targetUser = await prisma.user.findUnique({
      where: { id: assignment.receiverUserId },
      select: { id: true, displayName: true, email: true },
    });

    if (targetUser) {
      assignedUser = {
        id: targetUser.id,
        name: targetUser.displayName ?? targetUser.email,
        role: "user",
      };
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
    myWishlistItemCount: await countMyWishlistItems(eventId, userId),
  };
}

export async function getMyDraw(
  eventId: string,
  userId: string
): Promise<{
  id: string;
  eventCode: string;
  createdAtUtc: string;
  assignedUser: EventUserDto;
} | null> {
  const eventCode = await getEventCode(eventId);

  const latestDraw = await prisma.secretSantaDraw.findFirst({
    where: { eventCode },
    orderBy: { createdAtUtc: "desc" },
  });

  if (!latestDraw) return null;

  const assignment = await prisma.secretSantaAssignment.findFirst({
    where: { drawId: latestDraw.id, giverUserId: userId },
  });

  if (!assignment) return null;

  const targetUser = await prisma.user.findUnique({
    where: { id: assignment.receiverUserId },
    select: { id: true, displayName: true, email: true },
  });

  if (!targetUser) return null;

  return {
    id: latestDraw.id,
    eventCode: latestDraw.eventCode,
    createdAtUtc: latestDraw.createdAtUtc.toISOString(),
    assignedUser: {
      id: targetUser.id,
      name: targetUser.displayName ?? targetUser.email,
      role: "user",
    },
  };
}

async function getEventCode(eventId: string): Promise<string> {
  const state = await prisma.canhoesEventState.findUnique({
    where: { eventId },
    select: { secretSantaEventCode: true },
  });
  return state?.secretSantaEventCode ?? eventId;
}

async function countMyWishlistItems(eventId: string, userId: string): Promise<number> {
  return prisma.wishlistItem.count({ where: { eventId, userId } });
}
