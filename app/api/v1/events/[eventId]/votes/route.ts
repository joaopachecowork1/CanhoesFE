import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { castVote } from "@/lib/services/votingService";
import { evaluateModuleAccess } from "@/lib/middleware/withModuleAccess";
import { CreateEventVoteSchema } from "@/lib/zod/voting";
import { apiResponse, unauthorized, apiError, badRequest } from "@/lib/api/response";
import { strictRateLimit } from "@/lib/middleware/withRateLimit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const rl = strictRateLimit(req);
  if (rl) return rl;

  const session = await getServerSession(authOptions);
  if (!session?.user) return unauthorized();

  const { eventId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
  if (!isEnabled) return apiError("MODULE_DISABLED", "Module not available.", 403);

  const body = await req.json();
  const parsed = CreateEventVoteSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid input.");

  const vote = await castVote(eventId, userId, parsed.data.categoryId, parsed.data.selectionId);
  if (!vote) return apiError("VOTE_FAILED", "Could not cast vote.", 400);

  return apiResponse(vote);
}
