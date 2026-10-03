import { z } from "zod";

import { requireAdmin } from "@/lib/api/guards";
import { apiRoute, json, readJson } from "@/lib/api/route";
import { setAdminRole } from "@/lib/domains/admin/services/members";

const roleSchema = z.object({
  isAdmin: z.boolean(),
  confirmSelfDemotion: z.boolean().optional().default(false),
});

export const PATCH = apiRoute<{ eventId: string; userId: string }>(async (request, { eventId, userId }) => {
  const admin = await requireAdmin();
  const change = await readJson(request, roleSchema);
  const user = await setAdminRole({ actorUserId: admin.id, eventId, targetUserId: userId, ...change });
  return json({ user });
});
