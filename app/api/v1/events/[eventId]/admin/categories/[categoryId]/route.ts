import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/domains/auth/services/auth";
import { updateCategory, deleteCategory } from "@/lib/domains/admin/services/categories";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string; categoryId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }
  if (!(session.user as Record<string, unknown>).isAdmin) {
    return NextResponse.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });
  }

  const { eventId, categoryId } = await params;
  const body = await req.json();
  const updated = await updateCategory(eventId, categoryId, {
    name: body.name,
    sortOrder: body.sortOrder,
    isActive: body.isActive,
    kind: body.kind !== undefined ? Number(body.kind) : undefined,
    description: body.description,
    voteQuestion: body.voteQuestion,
    voteRules: body.voteRules,
  });

  if (!updated) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Category not found." }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string; categoryId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }
  if (!(session.user as Record<string, unknown>).isAdmin) {
    return NextResponse.json({ code: "FORBIDDEN", message: "Admin access required." }, { status: 403 });
  }

  const { eventId, categoryId } = await params;
  const deleted = await deleteCategory(eventId, categoryId);
  if (!deleted) {
    return NextResponse.json({ code: "CONFLICT", message: "Category has dependent nominees or votes and cannot be deleted." }, { status: 409 });
  }
  return new NextResponse(null, { status: 204 });
}
