import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/domains/auth/services/auth";
import { getMyDraw } from "@/lib/domains/secretSanta/services/secretSanta";
import { evaluateModuleAccess } from "@/lib/middleware/withModuleAccess";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
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

  const draw = await getMyDraw(eventId, userId);
  if (!draw) {
    return NextResponse.json({ code: "NOT_FOUND", message: "No Secret Santa draw found for you in this event." }, { status: 404 });
  }

  return NextResponse.json(draw);
}
