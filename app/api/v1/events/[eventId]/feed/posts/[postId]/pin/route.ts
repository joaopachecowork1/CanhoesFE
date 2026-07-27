import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { togglePin } from "@/lib/services/feedService";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string; postId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }
  if (!(session.user as Record<string, unknown>).isAdmin) {
    return NextResponse.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });
  }

  const { eventId, postId } = await params;
  const pinned = await togglePin(eventId, postId);
  if (!pinned) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Post not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
