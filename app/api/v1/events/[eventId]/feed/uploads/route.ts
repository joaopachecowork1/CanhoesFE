import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { evaluateModuleAccess } from "@/lib/middleware/withModuleAccess";

export const dynamic = "force-dynamic";

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

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "No files provided." }, { status: 400 });
  }

  const uploaded: { url: string; fileName: string; fileSize: number }[] = [];
  for (const file of files) {
    const url = `/uploads/feed/${eventId}/${Date.now()}_${file.name}`;
    uploaded.push({ url, fileName: file.name, fileSize: file.size });
  }

  return NextResponse.json({ files: uploaded });
}
