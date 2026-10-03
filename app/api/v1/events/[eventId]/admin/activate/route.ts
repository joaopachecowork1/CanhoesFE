import { notFound } from "@/lib/api/httpError";
import { requireAdmin } from "@/lib/api/guards";
import { apiRoute, json } from "@/lib/api/route";
import { activateEvent } from "@/lib/domains/admin/services/state";

export const PUT = apiRoute<{ eventId: string }>(async (_request, { eventId }) => {
  await requireAdmin();
  const event = await activateEvent(eventId);
  if (!event) throw notFound("Event not found.");
  return json(event);
});
