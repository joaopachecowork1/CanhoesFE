import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/domains/auth/services/auth";
import { prisma } from "@/lib/prisma";

export type RequestUser = {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
};

export class AuthorizationError extends Error {
  constructor(
    public readonly status: 401 | 403,
    public readonly code: "UNAUTHORIZED" | "FORBIDDEN",
    message: string
  ) {
    super(message);
  }
}

export async function getRequestUser(): Promise<RequestUser | null> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true, isAdmin: true },
  });
}

export async function requireUser(): Promise<RequestUser> {
  const user = await getRequestUser();
  if (!user) {
    throw new AuthorizationError(401, "UNAUTHORIZED", "Authentication required.");
  }
  return user;
}

export async function requireAdmin(): Promise<RequestUser> {
  const user = await requireUser();
  if (!user.isAdmin) {
    throw new AuthorizationError(403, "FORBIDDEN", "Admin access required.");
  }
  return user;
}
