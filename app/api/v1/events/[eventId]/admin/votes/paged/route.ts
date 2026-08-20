import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/domains/auth/services/auth";
import { getAdminVotesPaged } from "@/lib/domains/admin/services/votes";

export const dynamic = "force-dynamic";

export async function GET(
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
  const url = new URL(req.url);
  const skip = Math.max(0, parseInt(url.searchParams.get("skip") ?? "0", 10));
  const take = Math.min(200, Math.max(1, parseInt(url.searchParams.get("take") ?? "50", 10)));

  const paged = await getAdminVotesPaged(eventId, skip, take);
  return NextResponse.json(paged);
}
