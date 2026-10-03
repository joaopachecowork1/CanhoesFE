import { HttpError } from "@/lib/api/httpError";
import { requireEventAccess, requireUser } from "@/lib/api/guards";
import { apiRoute, json, readJson } from "@/lib/api/route";
import { castVote } from "@/lib/domains/voting/services/voting";
import { enforceRateLimit } from "@/lib/middleware/rateLimit";
import { CreateEventVoteSchema } from "@/lib/zod/voting";

export const POST = apiRoute<{ eventId: string }>(async (request, { eventId }) => {
  enforceRateLimit(request, "strict");
  const user = await requireUser();
  await requireEventAccess(eventId, user);
  const { categoryId, selectionId } = await readJson(request, CreateEventVoteSchema);

  const vote = await castVote(eventId, user.id, categoryId, selectionId);
  if (!vote) throw new HttpError(400, "VOTE_FAILED", "Could not cast vote.");
  return json(vote);
});
