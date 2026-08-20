import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/domains/auth/services/auth";
import { getAdminCategories, createCategory } from "@/lib/domains/admin/services/categories";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
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
  const categories = await getAdminCategories(eventId);
  return NextResponse.json(categories);
}

export async function POST(
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
  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "Name is required." }, { status: 400 });
  }

  const kind = body.kind !== undefined ? Number(body.kind) : 0;
  const category = await createCategory(eventId, {
    name: body.name,
    sortOrder: body.sortOrder ?? null,
    kind,
    description: body.description ?? null,
    voteQuestion: body.voteQuestion ?? null,
    voteRules: body.voteRules ?? null,
  });
  return NextResponse.json(category, { status: 201 });
}
