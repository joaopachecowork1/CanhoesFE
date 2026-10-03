import { z } from "zod";

import { requireAdmin } from "@/lib/api/guards";
import { apiRoute, json, readJson } from "@/lib/api/route";
import { updateAdminState } from "@/lib/domains/admin/services/state";

const stateSchema = z.object({
  nominationsVisible: z.boolean().optional(),
  resultsVisible: z.boolean().optional(),
  moduleVisibility: z.record(z.string(), z.boolean()).optional(),
});

export const PUT = apiRoute<{ eventId: string }>(async (request, { eventId }) => {
  await requireAdmin();
  const changes = await readJson(request, stateSchema);
  return json(await updateAdminState(eventId, changes));
});
