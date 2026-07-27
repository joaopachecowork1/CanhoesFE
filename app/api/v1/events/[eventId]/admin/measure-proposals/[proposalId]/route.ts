import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { updateMeasureProposal, deleteMeasureProposal } from "@/lib/services/adminService";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; proposalId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }
  if (!(session.user as Record<string, unknown>).isAdmin) {
    return NextResponse.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });
  }

  const { eventId, proposalId } = await params;
  const body = await req.json();
  const updated = await updateMeasureProposal(eventId, proposalId, {
    text: body.text,
    status: body.status,
  });

  if (!updated) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Proposal not found." }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; proposalId: string }> }
) {
  return PATCH(req, { params });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string; proposalId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }
  if (!(session.user as Record<string, unknown>).isAdmin) {
    return NextResponse.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });
  }

  const { eventId, proposalId } = await params;
  const deleted = await deleteMeasureProposal(eventId, proposalId);
  if (!deleted) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Proposal not found." }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
