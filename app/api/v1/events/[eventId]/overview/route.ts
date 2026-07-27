import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getEventOverview } from "@/lib/services/eventService";
import { apiResponse, unauthorized } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return unauthorized();

  const { eventId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const overview = await getEventOverview(eventId, userId, isAdmin);
  if (!overview) return apiResponse(null, 404);

  return apiResponse(overview);
}
