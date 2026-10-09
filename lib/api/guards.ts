import { getServerSession } from "next-auth";

import { HttpError, unauthorized } from "@/lib/api/httpError";
import { authOptions } from "@/lib/domains/auth/services/auth";
import { prisma } from "@/lib/prisma";

export type SessionUser = { id: string; isAdmin: boolean };

/**
 * The signed-in user, or a 401. The NextAuth `jwt` callback re-reads the user from the
 * database on every request, so `isAdmin` is always current.
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw unauthorized();
  }
  return { id: session.user.id, isAdmin: Boolean(session.user.isAdmin) };
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (!user.isAdmin) {
    throw new HttpError(403, "FORBIDDEN", "Admin access required.");
  }
  return user;
}

export async function requireEventAccess(eventId: string, user: SessionUser): Promise<void> {
  if (user.isAdmin) return;

  const membership = await prisma.eventMember.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
    select: { id: true },
  });
  if (!membership) {
    throw new HttpError(403, "MODULE_DISABLED", "Module not available.");
  }
}
