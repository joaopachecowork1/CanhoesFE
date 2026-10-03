import { notFound } from "@/lib/api/httpError";
import { requireAdmin } from "@/lib/api/guards";
import { apiRoute, json } from "@/lib/api/route";
import { rejectNomination } from "@/lib/domains/admin/services/nominations";

export const POST = apiRoute<{ eventId: string; nomineeId: string }>(async (_request, { eventId, nomineeId }) => {
  await requireAdmin();
  const nominee = await rejectNomination(eventId, nomineeId);
  if (!nominee) throw notFound("Nominee not found.");
  return json(nominee);
});
