import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/domains/auth/services/auth";
import { getActiveEventContext } from "@/lib/domains/event/services/event";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Authentication required." },
      { status: 401 }
    );
  }

  const userId = (session.user as Record<string, unknown>).id as string;
  const isAdmin = Boolean((session.user as Record<string, unknown>).isAdmin);

  const context = await getActiveEventContext(userId, isAdmin);
  if (!context) {
    return NextResponse.json(
      { code: "NO_ACTIVE_EVENT", message: "No active event found." },
      { status: 404 }
    );
  }

  return NextResponse.json(context);
}
