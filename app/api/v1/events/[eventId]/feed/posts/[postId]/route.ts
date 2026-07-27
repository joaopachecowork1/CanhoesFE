import { NextRequest, NextResponse } from "next/server";
import { AuthorizationError, requireAdmin } from "@/lib/auth/serverAuth";
import { deleteFeedPost } from "@/lib/services/feedService";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string; postId: string }> }
) {
  try {
    await requireAdmin();
    const { eventId, postId } = await params;
    const deleted = await deleteFeedPost(eventId, postId);
    if (!deleted) {
      return NextResponse.json({ code: "NOT_FOUND", message: "Post not found." }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ code: "POST_DELETE_FAILED", message: "Unable to delete post." }, { status: 500 });
  }
}
