import { requireEventAccess, requireUser } from "@/lib/api/guards";
import { apiRoute, json, readPaging } from "@/lib/api/route";
import { getActiveCategories } from "@/lib/domains/admin/services/categories";

export const GET = apiRoute<{ eventId: string }>(async (request, { eventId }) => {
  const user = await requireUser();
  await requireEventAccess(eventId, user);
  const { skip, take } = readPaging(request, { maxTake: 1000 });
  return json(await getActiveCategories(eventId, skip, take));
});
