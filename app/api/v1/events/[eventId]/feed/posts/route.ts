import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/serverAuth";
import { getFeedPosts, createFeedPost } from "@/lib/services/feedService";
import { evaluateModuleAccess } from "@/lib/middleware/withModuleAccess";
import { CreateFeedPostSchema } from "@/lib/zod/feed";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }

  const { eventId } = await params;
  const { id: userId, isAdmin } = user;

  const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
  if (!isEnabled) {
    return NextResponse.json({ code: "MODULE_DISABLED", message: "Module not available." }, { status: 403 });
  }

  const url = new URL(req.url);
  const skip = Math.max(0, parseInt(url.searchParams.get("skip") ?? "0", 10));
  const take = Math.min(50, Math.max(1, parseInt(url.searchParams.get("take") ?? "15", 10)));

  const posts = await getFeedPosts(eventId, userId, skip, take);
  return NextResponse.json(posts);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }

  const { eventId } = await params;
  const { id: userId, isAdmin } = user;

  const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
  if (!isEnabled) {
    return NextResponse.json({ code: "MODULE_DISABLED", message: "Module not available." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = CreateFeedPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const post = await createFeedPost(eventId, userId, parsed.data);
  return NextResponse.json(post, { status: 201 });
}
