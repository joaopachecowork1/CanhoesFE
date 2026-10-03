import { requireEventAccess, requireUser } from "@/lib/api/guards";
import { apiRoute, json } from "@/lib/api/route";
import { getMembers } from "@/lib/domains/members/services/members";

export const GET = apiRoute<{ eventId: string }>(async (_request, { eventId }) => {
  const user = await requireUser();
  await requireEventAccess(eventId, user);
  return json(await getMembers(eventId));
});
