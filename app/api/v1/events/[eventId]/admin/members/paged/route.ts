import { requireAdmin } from "@/lib/api/guards";
import { apiRoute, json, readPaging } from "@/lib/api/route";
import { getAdminMembersPaged } from "@/lib/domains/admin/services/members";

export const GET = apiRoute<{ eventId: string }>(async (request, { eventId }) => {
  await requireAdmin();
  const { skip, take } = readPaging(request);
  return json(await getAdminMembersPaged(eventId, skip, take));
});
