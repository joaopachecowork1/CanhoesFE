import { NextRequest, NextResponse } from "next/server";
import { readUpload, UploadValidationError } from "@/lib/storage/localStorage";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await context.params;
  if (!Array.isArray(segments) || segments.length === 0) {
    return NextResponse.json({ message: "Missing upload path" }, { status: 400 });
  }

  try {
    const { buffer, contentType } = await readUpload(segments);
    const maxAge = 86400;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": `public, max-age=${maxAge}, immutable`,
      },
    });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "File not found" }, { status: 404 });
  }
}
