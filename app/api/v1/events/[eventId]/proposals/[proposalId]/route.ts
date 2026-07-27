import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UpdateEventProposalSchema } from "@/lib/zod/voting";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; proposalId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }

  const { eventId, proposalId } = await params;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);
  if (!isAdmin) {
    return NextResponse.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateEventProposalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const proposal = await prisma.categoryProposal.findFirst({
    where: { id: proposalId, eventId },
  });
  if (!proposal) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Proposal not found." }, { status: 404 });
  }

  const updated = await prisma.categoryProposal.update({
    where: { id: proposalId },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({
    id: updated.id,
    eventId: updated.eventId,
    userId: updated.proposedByUserId,
    name: updated.name,
    description: updated.description,
    status: updated.status,
    createdAt: updated.createdAtUtc.toISOString(),
  });
}
