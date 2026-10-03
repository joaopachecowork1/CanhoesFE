import { requireEventAccess, requireUser } from "@/lib/api/guards";
import { apiRoute, json, readJson } from "@/lib/api/route";
import { createNomination } from "@/lib/domains/members/services/members";
import { CreateNomineeSchema } from "@/lib/zod/nomination";

export const POST = apiRoute<{ eventId: string }>(async (request, { eventId }) => {
  const user = await requireUser();
  await requireEventAccess(eventId, user);
  const nomination = await readJson(request, CreateNomineeSchema);
  return json(await createNomination(eventId, user.id, nomination));
});
