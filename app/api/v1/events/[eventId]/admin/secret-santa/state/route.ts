import { requireAdmin } from "@/lib/api/guards";
import { apiRoute, json } from "@/lib/api/route";
import { getAdminSecretSantaState } from "@/lib/domains/admin/services/secretSanta";

export const GET = apiRoute<{ eventId: string }>(async (_request, { eventId }) => {
  await requireAdmin();
  return json(await getAdminSecretSantaState(eventId));
});
