import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/domains/auth/services/auth";
import { prisma } from "@/lib/prisma";

export type RequestUser = {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
};

/** The signed-in user's profile, or null without a session. For route handlers use `requireUser` from `lib/api/guards`. */
export async function getRequestUser(): Promise<RequestUser | null> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true, isAdmin: true },
  });
}
