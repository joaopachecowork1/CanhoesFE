import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/domains/auth/services/auth";
import { setNominationCategory } from "@/lib/domains/admin/services/nominations";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; nomineeId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }
  if (!(session.user as Record<string, unknown>).isAdmin) {
    return NextResponse.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });
  }

  const { eventId, nomineeId } = await params;
  const body = await req.json();
  const nominee = await setNominationCategory(eventId, nomineeId, body.categoryId ?? null);
  if (!nominee) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Nominee not found." }, { status: 404 });
  }
  return NextResponse.json(nominee);
}
