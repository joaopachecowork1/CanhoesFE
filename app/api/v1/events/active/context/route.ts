import { HttpError } from "@/lib/api/httpError";
import { requireUser } from "@/lib/api/guards";
import { apiRoute, json } from "@/lib/api/route";
import { getActiveEventContext } from "@/lib/domains/event/services/event";

export const GET = apiRoute(async () => {
  const user = await requireUser();
  const context = await getActiveEventContext(user.id, user.isAdmin);
  if (!context) throw new HttpError(404, "NO_ACTIVE_EVENT", "No active event found.");
  return json(context);
});
