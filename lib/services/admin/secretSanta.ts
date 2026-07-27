import { prisma } from "@/lib/prisma";
import type { EventAdminSecretSantaStateDto } from "@/lib/api/types";

export async function getAdminSecretSantaState(eventId: string): Promise<EventAdminSecretSantaStateDto> {
  const state = await prisma.canhoesEventState.findUnique({ where: { eventId } });
  const eventCode = state?.secretSantaEventCode ?? eventId;

  const latestDraw = await prisma.secretSantaDraw.findFirst({
    where: { eventCode },
    orderBy: { createdAtUtc: "desc" },
  });

  const [memberCount, assignmentCount] = await Promise.all([
    prisma.eventMember.count({ where: { eventId } }),
    latestDraw
      ? prisma.secretSantaAssignment.count({ where: { drawId: latestDraw.id } })
      : Promise.resolve(0),
  ]);

  return {
    eventId,
    eventCode,
    hasDraw: !!latestDraw,
    drawId: latestDraw?.id ?? null,
    createdAtUtc: latestDraw?.createdAtUtc.toISOString() ?? null,
    isLocked: latestDraw?.isLocked ?? false,
    memberCount,
    assignmentCount,
  };
}

export async function executeSecretSantaDraw(eventId: string, createdByUserId: string, eventCode?: string): Promise<EventAdminSecretSantaStateDto> {
  const code = eventCode?.trim() || eventId;

  const existingDraw = await prisma.secretSantaDraw.findFirst({
    where: { eventCode: code },
    orderBy: { createdAtUtc: "desc" },
  });

  if (existingDraw?.isLocked) {
    throw new Error("Draw is already locked. Cannot re-run.");
  }

  const members = await prisma.eventMember.findMany({
    where: { eventId },
  });

  const memberUserIds = [...new Set(members.map((m) => m.userId))];
  const memberUsers = memberUserIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: memberUserIds } }, select: { id: true, displayName: true, email: true } })
    : [];
  const memberUserMap = new Map(memberUsers.map((u) => [u.id, u]));

  const participants = members.map((m) => {
    const u = memberUserMap.get(m.userId);
    return { id: m.userId, name: u?.displayName ?? u?.email ?? "Unknown" };
  });

  if (participants.length < 2) {
    throw new Error("Need at least 2 participants for Secret Santa.");
  }

  // Fisher-Yates shuffle
  const shuffled = [...participants];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Ensure no one gets themselves
  const assignments: { giverUserId: string; receiverUserId: string }[] = [];
  for (let i = 0; i < shuffled.length; i++) {
    const giver = shuffled[i];
    const receiver = shuffled[(i + 1) % shuffled.length];
    if (giver.id === receiver.id) {
      // Swap with next person to avoid self-assignment
      const nextIdx = (i + 2) % shuffled.length;
      if (nextIdx !== i) {
        [shuffled[(i + 1) % shuffled.length], shuffled[nextIdx]] = [shuffled[nextIdx], shuffled[(i + 1) % shuffled.length]];
      }
      const receiver2 = shuffled[(i + 1) % shuffled.length];
      if (giver.id !== receiver2.id) {
        assignments.push({ giverUserId: giver.id, receiverUserId: receiver2.id });
      } else {
        throw new Error("Could not generate valid Secret Santa pairs. Try again.");
      }
    } else {
      assignments.push({ giverUserId: giver.id, receiverUserId: receiver.id });
    }
  }

  // Use transaction
  await prisma.$transaction(async (tx) => {
    const existing = await tx.secretSantaDraw.findMany({
      where: { eventCode: code },
      select: { id: true },
    });
    if (existing.length > 0) {
      await tx.secretSantaAssignment.deleteMany({
        where: { drawId: { in: existing.map((d) => d.id) } },
      });
      await tx.secretSantaDraw.deleteMany({ where: { eventCode: code } });
    }

    const draw = await tx.secretSantaDraw.create({
      data: {
        eventCode: code,
        createdByUserId,
        isLocked: true,
      },
    });

    await tx.secretSantaAssignment.createMany({
      data: assignments.map((a) => ({ ...a, drawId: draw.id })),
    });
  });

  const existingState = await prisma.canhoesEventState.findUnique({ where: { eventId } });
  await prisma.canhoesEventState.upsert({
    where: { eventId },
    create: {
      eventId,
      phase: existingState?.phase ?? "gala",
      nominationsVisible: existingState?.nominationsVisible ?? true,
      resultsVisible: existingState?.resultsVisible ?? false,
      hasSecretSantaDraw: true,
      secretSantaEventCode: code,
    },
    update: { hasSecretSantaDraw: true, secretSantaEventCode: code },
  });

  return getAdminSecretSantaState(eventId);
}
