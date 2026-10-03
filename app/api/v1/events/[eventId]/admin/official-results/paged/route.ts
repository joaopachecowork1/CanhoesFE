import { requireAdmin } from "@/lib/api/guards";
import { apiRoute, json, readPaging } from "@/lib/api/route";
import { getAdminOfficialResultsPaged } from "@/lib/domains/admin/services/votes";

export const GET = apiRoute<{ eventId: string }>(async (request, { eventId }) => {
  await requireAdmin();
  const { skip, take } = readPaging(request);
  return json(await getAdminOfficialResultsPaged(eventId, skip, take));
});
