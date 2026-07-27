import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { deleteComment } from "@/lib/services/feedService";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string; postId: string; commentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }

  const { eventId, postId, commentId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const deleted = await deleteComment(eventId, postId, commentId, userId, isAdmin);
  if (!deleted) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Comment not found or not authorized." }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
