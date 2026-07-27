import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const C_SHARP_UPLOADS_DIR = "C:\\PessoalRepo\\CanhoesRepos\\CanhoesBE\\Canhoes.API\\wwwroot";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] ?? "application/octet-stream";
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await context.params;
  if (!Array.isArray(segments) || segments.length === 0) {
    return NextResponse.json({ message: "Missing upload path" }, { status: 400 });
  }

  const relativePath = segments.join("\\");
  const physicalPath = path.resolve(C_SHARP_UPLOADS_DIR, relativePath);

  if (!physicalPath.startsWith(C_SHARP_UPLOADS_DIR)) {
    return NextResponse.json({ message: "Invalid path" }, { status: 400 });
  }

  try {
    const buffer = await fs.readFile(physicalPath);
    const contentType = getContentType(physicalPath);
    const maxAge = 86400;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": `public, max-age=${maxAge}, immutable`,
      },
    });
  } catch {
    return NextResponse.json({ message: "File not found" }, { status: 404 });
  }
}
