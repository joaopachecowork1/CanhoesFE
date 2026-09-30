import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    const event = await prisma.event.findFirst();
    const user = await prisma.user.findFirst();
    if (!event || !user) {
      console.log("Missing event or user");
      return;
    }
    
    // Find a category
    const category = await prisma.awardCategory.findFirst({
      where: { eventId: event.id }
    });
    
    console.log("Creating nominee...");
    const nominee = await prisma.nominee.create({
      data: {
        eventId: event.id,
        submittedByUserId: user.id,
        title: "Test Nominee",
        categoryId: category ? category.id : null,
        submissionKind: "nominees",
        imageUrl: null,
        status: "pending",
      }
    });
    console.log("Success:", nominee.id);
    
    await prisma.nominee.delete({ where: { id: nominee.id }});
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
