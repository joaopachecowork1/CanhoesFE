import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/domains/auth/services/auth";
import { updateAdminPhase } from "@/lib/domains/admin/services/state";

export const dynamic = "force-dynamic";

export async function PUT(
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
  const body = await req.json();
  if (!body.phaseType || typeof body.phaseType !== "string") {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "PhaseType is required." }, { status: 400 });
  }

  const state = await updateAdminPhase(eventId, body.phaseType.trim());
  return NextResponse.json(state);
}
