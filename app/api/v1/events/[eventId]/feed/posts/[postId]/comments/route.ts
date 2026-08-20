import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/domains/auth/services/auth";
import { getPostComments } from "@/lib/domains/feed/services/feed";
import { createComment } from "@/lib/domains/feed/services/feed";
import { evaluateModuleAccess } from "@/lib/middleware/withModuleAccess";
import { CreateFeedCommentSchema } from "@/lib/zod/feed";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string; postId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }

  const { eventId, postId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
  if (!isEnabled) {
    return NextResponse.json({ code: "MODULE_DISABLED", message: "Module not available." }, { status: 403 });
  }

  const comments = await getPostComments(eventId, postId, userId);
  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; postId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }

  const { eventId, postId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
  if (!isEnabled) {
    return NextResponse.json({ code: "MODULE_DISABLED", message: "Module not available." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = CreateFeedCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const comment = await createComment(eventId, postId, userId, parsed.data.text);
  return NextResponse.json(comment, { status: 201 });
}
