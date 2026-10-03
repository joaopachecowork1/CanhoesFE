import { notFound } from "@/lib/api/httpError";
import { requireUser } from "@/lib/api/guards";
import { apiRoute, noContent } from "@/lib/api/route";
import { deleteWishlistItem } from "@/lib/domains/members/services/members";

export const DELETE = apiRoute<{ eventId: string; itemId: string }>(async (_request, { eventId, itemId }) => {
  const user = await requireUser();
  const deleted = await deleteWishlistItem(eventId, itemId, user.id, user.isAdmin);
  if (!deleted) throw notFound("Item not found.");
  return noContent();
});
