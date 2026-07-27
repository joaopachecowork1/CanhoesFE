import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getEventContext } from "@/lib/services/eventService";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Authentication required." },
      { status: 401 }
    );
  }

  const { eventId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const context = await getEventContext(eventId, userId, isAdmin);
  if (!context) {
    return NextResponse.json(
      { code: "EVENT_NOT_FOUND", message: "Event not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(context);
}
