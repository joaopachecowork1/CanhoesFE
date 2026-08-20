import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/domains/auth/services/auth";
import { getProposals } from "@/lib/domains/voting/services/voting";
import { createProposal } from "@/lib/domains/voting/services/voting";
import { evaluateModuleAccess } from "@/lib/middleware/withModuleAccess";
import { CreateEventProposalSchema } from "@/lib/zod/voting";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }

  const { eventId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
  if (!isEnabled) {
    return NextResponse.json({ code: "MODULE_DISABLED", message: "Module not available." }, { status: 403 });
  }

  const url = new URL(req.url);
  const skip = parseInt(url.searchParams.get("skip") || "0", 10);
  const take = Math.min(parseInt(url.searchParams.get("take") || "50", 10), 200);

  const proposals = await getProposals(eventId, skip, take);
  return NextResponse.json(proposals);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }

  const { eventId } = await params;
  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
  if (!isEnabled) {
    return NextResponse.json({ code: "MODULE_DISABLED", message: "Module not available." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = CreateEventProposalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const proposal = await createProposal(eventId, userId, parsed.data.name, parsed.data.description, parsed.data.kind);
  return NextResponse.json(proposal);
}
