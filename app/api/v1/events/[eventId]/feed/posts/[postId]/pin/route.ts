import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthorizationError, requireAdmin } from "@/lib/domains/auth/services/serverAuth";
import { movePinnedPost } from "@/lib/domains/feed/services/feed";
import { togglePin } from "@/lib/domains/feed/services/feed";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string; postId: string }> }
) {
  try {
    await requireAdmin();
    const { eventId, postId } = await params;
    const result = await togglePin(eventId, postId);
    if (!result) {
      return NextResponse.json({ code: "NOT_FOUND", message: "Post not found." }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ code: "PIN_UPDATE_FAILED", message: "Unable to update post pin." }, { status: 500 });
  }
}

const reorderSchema = z.object({ direction: z.enum(["up", "down"]) }).strict();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; postId: string }> }
) {
  try {
    await requireAdmin();
    const parsed = reorderSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ code: "VALIDATION_ERROR", message: "Invalid post direction." }, { status: 400 });
    }
    const { eventId, postId } = await params;
    const moved = await movePinnedPost(eventId, postId, parsed.data.direction);
    if (!moved) {
      return NextResponse.json({ code: "NOT_FOUND", message: "Pinned post not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ code: "POST_REORDER_FAILED", message: "Unable to reorder pinned post." }, { status: 500 });
  }
}
