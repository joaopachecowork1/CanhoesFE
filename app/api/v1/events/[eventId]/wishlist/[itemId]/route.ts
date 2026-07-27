import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { deleteWishlistItem } from "@/lib/services/memberService";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string; itemId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }

  const { eventId, itemId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const success = await deleteWishlistItem(eventId, itemId, userId, isAdmin);
  if (!success) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Item not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
