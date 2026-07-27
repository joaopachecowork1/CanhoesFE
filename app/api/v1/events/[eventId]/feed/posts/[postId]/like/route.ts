import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { toggleLike } from "@/lib/services/feedService";
import { evaluateModuleAccess } from "@/lib/middleware/withModuleAccess";
import { apiResponse, unauthorized, apiError } from "@/lib/api/response";
import { standardRateLimit } from "@/lib/middleware/withRateLimit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; postId: string }> }
) {
  const rl = standardRateLimit(req);
  if (rl) return rl;

  const session = await getServerSession(authOptions);
  if (!session?.user) return unauthorized();

  const { eventId, postId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
  if (!isEnabled) return apiError("MODULE_DISABLED", "Module not available.", 403);

  await toggleLike(eventId, postId, userId);
  return apiResponse({ success: true });
}
