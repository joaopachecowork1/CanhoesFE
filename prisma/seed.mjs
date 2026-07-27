import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function adminEmails() {
  const configured = process.env.ADMIN_EMAILS?.trim()
    || process.env.DEV_AUTH_EMAIL?.trim()
    || "dev@example.com";
  return configured
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function main() {
  const seededAdmins = [];
  for (const email of adminEmails()) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        externalId: `seed:${email}`,
        email,
        displayName: email.split("@")[0],
        isAdmin: true,
      },
    });
    seededAdmins.push(user);
  }

  const event = await prisma.event.upsert({
    where: { id: "canhoes-local" },
    update: {},
    create: {
      id: "canhoes-local",
      name: "Canhoes Local",
      isActive: true,
    },
  });

  await prisma.canhoesEventState.upsert({
    where: { eventId: event.id },
    update: {},
    create: {
      eventId: event.id,
      phase: "Nominations",
      nominationsVisible: true,
      resultsVisible: false,
      moduleVisibilityJson: {},
      hasSecretSantaDraw: false,
    },
  });

  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setUTCFullYear(nextYear.getUTCFullYear() + 1);
  await prisma.eventPhase.upsert({
    where: { eventId_type: { eventId: event.id, type: "PROPOSALS" } },
    update: {},
    create: {
      eventId: event.id,
      type: "PROPOSALS",
      startDateUtc: now,
      endDateUtc: nextYear,
      isActive: true,
    },
  });

  for (const admin of seededAdmins) {
    await prisma.eventMember.upsert({
      where: { eventId_userId: { eventId: event.id, userId: admin.id } },
      update: {},
      create: {
        eventId: event.id,
        userId: admin.id,
        role: "admin",
        joinedAtUtc: now,
      },
    });
  }
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
