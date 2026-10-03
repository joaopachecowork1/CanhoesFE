import { z } from "zod";

import { requireAdmin } from "@/lib/api/guards";
import { apiRoute, json, readJson } from "@/lib/api/route";
import { updateAdminPhase } from "@/lib/domains/admin/services/state";

const phaseSchema = z.object({
  phaseType: z.string({ error: "PhaseType is required." }).trim().min(1, "PhaseType is required."),
});

export const PUT = apiRoute<{ eventId: string }>(async (request, { eventId }) => {
  await requireAdmin();
  const { phaseType } = await readJson(request, phaseSchema);
  return json(await updateAdminPhase(eventId, phaseType));
});
