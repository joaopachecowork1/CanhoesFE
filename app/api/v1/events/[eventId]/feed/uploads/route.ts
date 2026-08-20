import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/domains/auth/services/serverAuth";
import { evaluateModuleAccess } from "@/lib/middleware/withModuleAccess";
import { prisma } from "@/lib/prisma";
import { saveUpload, UploadValidationError } from "@/lib/storage/localStorage";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Authentication required." }, { status: 401 });
  }

  const { eventId } = await params;
  const { id: userId, isAdmin } = user;

  const { isEnabled } = await evaluateModuleAccess(eventId, userId, isAdmin);
  if (!isEnabled) {
    return NextResponse.json({ code: "MODULE_DISABLED", message: "Module not available." }, { status: 403 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "No files provided." }, { status: 400 });
  }
  if (files.length > 4) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "A maximum of 4 images is allowed." }, { status: 400 });
  }

  try {
    const uploaded = await Promise.all(files.map((file) => saveUpload(file, ["feed", eventId])));
    await prisma.hubPostMedia.createMany({
      data: uploaded.map((item) => ({
        url: item.url,
        originalFileName: item.fileName,
        fileSizeBytes: BigInt(item.fileSize),
        uploadedByUserId: userId,
        contentType: item.contentType,
        uploadedAtUtc: new Date(),
      })),
    });
    return NextResponse.json({ files: uploaded.map(({ contentType: _contentType, ...item }) => item) });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ code: "VALIDATION_ERROR", message: error.message }, { status: 400 });
    }
    throw error;
  }
}
