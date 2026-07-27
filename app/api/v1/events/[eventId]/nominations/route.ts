import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import {
  getMyNominationStatus,
  getApprovedNominees,
  createNomination,
} from "@/lib/services/memberService";
import { evaluateModuleAccess } from "@/lib/middleware/withModuleAccess";
import { CreateNomineeSchema } from "@/lib/zod/nomination";

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

  const url = new URL(req.url);
  const path = url.pathname;

  // GET /nominations/my-status
  if (path.endsWith("/nominations/my-status")) {
    const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
    if (!isEnabled) {
      return NextResponse.json({ code: "MODULE_DISABLED", message: "Module not available." }, { status: 403 });
    }
    const status = await getMyNominationStatus(eventId, userId);
    return NextResponse.json(status);
  }

  // GET /nominations/approved
  if (path.endsWith("/nominations/approved")) {
    const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
    if (!isEnabled) {
      return NextResponse.json({ code: "MODULE_DISABLED", message: "Module not available." }, { status: 403 });
    }
    const nominees = await getApprovedNominees(eventId);
    return NextResponse.json(nominees);
  }

  // GET /nominations (unrecognized sub-path)
  return NextResponse.json({ code: "NOT_FOUND", message: "Endpoint not found." }, { status: 404 });
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

  const body = await req.json();
  const parsed = CreateNomineeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
  if (!isEnabled) {
    return NextResponse.json({ code: "MODULE_DISABLED", message: "Module not available." }, { status: 403 });
  }

  const nominee = await createNomination(eventId, userId, parsed.data);
  return NextResponse.json(nominee);
}
