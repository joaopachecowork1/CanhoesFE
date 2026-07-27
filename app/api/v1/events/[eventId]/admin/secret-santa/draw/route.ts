import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { executeSecretSantaDraw } from "@/lib/services/adminService";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }
  if (!(session.user as Record<string, unknown>).isAdmin) {
    return NextResponse.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });
  }

  const { eventId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;

  let eventCode: string | undefined;
  try {
    const body = await req.json();
    eventCode = body.eventCode;
  } catch {
    // no body, that's fine
  }

  try {
    const state = await executeSecretSantaDraw(eventId, userId, eventCode);
    return NextResponse.json(state);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to execute draw.";
    return NextResponse.json({ code: "DRAW_ERROR", message }, { status: 400 });
  }
}
