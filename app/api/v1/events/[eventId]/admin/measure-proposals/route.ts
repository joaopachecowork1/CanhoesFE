import { requireAdmin } from "@/lib/api/guards";
import { apiRoute, json, readPaging } from "@/lib/api/route";
import { getMeasureProposals } from "@/lib/domains/admin/services/proposals";

export const GET = apiRoute<{ eventId: string }>(async (request, { eventId }) => {
  await requireAdmin();
  const status = request.nextUrl.searchParams.get("status");
  const { skip, take } = readPaging(request);
  return json(await getMeasureProposals(eventId, status, skip, take));
});
