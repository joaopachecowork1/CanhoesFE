import { requireEventAccess, requireUser } from "@/lib/api/guards";
import { apiRoute, json } from "@/lib/api/route";
import { getOverview } from "@/lib/domains/secretSanta/services/secretSanta";

export const GET = apiRoute<{ eventId: string }>(async (_request, { eventId }) => {
  const user = await requireUser();
  await requireEventAccess(eventId, user);
  return json(await getOverview(eventId, user.id));
});
