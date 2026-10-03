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

/**
 * Admins always pass; members need the event to be set up (to have a `CanhoesEventState`).
 * Which modules a member can see comes from the event overview and is applied by the UI;
 * it is not enforced per endpoint.
 */
export async function requireEventAccess(eventId: string, user: SessionUser): Promise<void> {
  if (user.isAdmin) return;

  const state = await prisma.canhoesEventState.findUnique({ where: { eventId }, select: { id: true } });
  if (!state) {
    throw new HttpError(403, "MODULE_DISABLED", "Module not available.");
  }
}
