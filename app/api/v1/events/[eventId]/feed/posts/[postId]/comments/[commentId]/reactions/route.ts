import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { toggleCommentReaction } from "@/lib/services/feedService";
import { ToggleFeedReactionSchema } from "@/lib/zod/feed";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; postId: string; commentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }

  const { eventId, postId, commentId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;

  const body = await req.json();
  const parsed = ToggleFeedReactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  await toggleCommentReaction(eventId, postId, commentId, userId, parsed.data.emoji ?? "heart");
  return NextResponse.json({ success: true });
}
