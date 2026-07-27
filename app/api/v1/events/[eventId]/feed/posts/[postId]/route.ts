import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { deleteFeedPost } from "@/lib/services/feedService";

export const dynamic = "force-dynamic";

export async function DELETE(
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
  const deleted = await deleteFeedPost(eventId, postId);
  if (!deleted) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Post not found." }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
