import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/domains/auth/services/auth";
import { activateEvent } from "@/lib/domains/admin/services/state";

export const dynamic = "force-dynamic";

export async function PUT(
  _req: NextRequest,
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
  const event = await activateEvent(eventId);
  if (!event) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Event not found." }, { status: 404 });
  }
  return NextResponse.json(event);
}
