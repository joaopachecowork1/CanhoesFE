import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { updateWishlistImage } from "@/lib/services/memberService";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; itemId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }

  const { eventId, itemId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file || file.size <= 0) {
    return NextResponse.json({ code: "FILE_REQUIRED", message: "File is required." }, { status: 400 });
  }

  const imageUrl = `/uploads/canhoes/wishlist/${crypto.randomUUID()}-${file.name}`;

  const item = await updateWishlistImage(eventId, itemId, userId, isAdmin, imageUrl);
  if (!item) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Item not found." }, { status: 404 });
  }

  return NextResponse.json(item);
}
