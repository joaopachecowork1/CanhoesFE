import { prisma } from "@/lib/prisma";

export type ResolvedUser = {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
};

export async function resolveUser(
  externalId: string,
  email: string,
  displayName: string | null
): Promise<ResolvedUser> {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ externalId }, { email }],
    },
  });

  if (existing) {
    if (displayName && existing.displayName !== displayName) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { displayName },
      });
    }
    return {
      id: existing.id,
      email: existing.email,
      displayName: existing.displayName ?? displayName,
      isAdmin: existing.isAdmin,
    };
  }

  const user = await prisma.user.create({
    data: {
      externalId,
      email,
      displayName: displayName ?? email,
      isAdmin: false,
    },
  });

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    isAdmin: user.isAdmin,
  };
}
