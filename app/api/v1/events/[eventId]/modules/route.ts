import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getEventOverview } from "@/lib/services/eventService";
import { updateEventModules } from "@/lib/services/adminService";

export const dynamic = "force-dynamic";

export async function PATCH(
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

  const body = await req.json();
  if (!body.modules) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "Modules object is required." }, { status: 400 });
  }

  await updateEventModules(eventId, body.modules);
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);
  const overview = await getEventOverview(eventId, userId, isAdmin);
  if (!overview) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Event not found." }, { status: 404 });
  }
  return NextResponse.json(overview);
}
