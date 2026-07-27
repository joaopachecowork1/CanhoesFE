import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getWishlistItems, createWishlistItem } from "@/lib/services/memberService";
import { evaluateModuleAccess } from "@/lib/middleware/withModuleAccess";
import { CreateWishlistItemSchema } from "@/lib/zod/wishlist";
import { apiResponse, unauthorized, apiError, badRequest } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return unauthorized();

  const { eventId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
  if (!isEnabled) {
    return apiError("MODULE_DISABLED", "Wishlist module not available.", 403);
  }

  const items = await getWishlistItems(eventId, userId);
  return apiResponse(items);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return unauthorized();

  const { eventId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
  if (!isEnabled) {
    return apiError("MODULE_DISABLED", "Wishlist module not available.", 403);
  }

  const body = await req.json();
  const parsed = CreateWishlistItemSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const item = await createWishlistItem(eventId, userId, parsed.data);
  return apiResponse(item, 201);
}
