import { z } from "zod";

import { requireAdmin } from "@/lib/api/guards";
import { apiRoute, json, readJson } from "@/lib/api/route";
import { executeSecretSantaDraw } from "@/lib/domains/admin/services/secretSanta";

const drawSchema = z.object({ eventCode: z.string().optional() });

export const POST = apiRoute<{ eventId: string }>(async (request, { eventId }) => {
  const admin = await requireAdmin();
  const { eventCode } = await readJson(request, drawSchema);
  return json(await executeSecretSantaDraw(eventId, admin.id, eventCode));
});
