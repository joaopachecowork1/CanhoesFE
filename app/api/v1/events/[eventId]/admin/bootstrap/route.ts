import { requireAdmin } from "@/lib/api/guards";
import { apiRoute, json } from "@/lib/api/route";
import { getAdminBootstrap } from "@/lib/domains/admin/services/state";

export const GET = apiRoute<{ eventId: string }>(async (_request, { eventId }) => {
  await requireAdmin();
  return json(await getAdminBootstrap(eventId));
});
