import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { approveMeasureProposal } from "@/lib/services/adminService";

export const dynamic = "force-dynamic";

export async function POST(
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
  const measure = await approveMeasureProposal(eventId, proposalId);
  if (!measure) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Proposal not found." }, { status: 404 });
  }
  return NextResponse.json(measure);
}
