import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getHomeSnapshot } from "@/lib/services/eventService";
import { apiResponse, unauthorized } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return unauthorized();

  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const snapshot = await getHomeSnapshot(userId, isAdmin);
  if (!snapshot) return apiResponse(null, 404);

  return apiResponse(snapshot);
}
