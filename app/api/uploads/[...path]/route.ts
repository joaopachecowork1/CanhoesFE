import { NextRequest, NextResponse } from "next/server";

const backend =
  process.env.CANHOES_API_URL ||
  process.env.NEXT_PUBLIC_CANHOES_API_URL ||
  "http://localhost:5000";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  if (!Array.isArray(path) || path.length === 0) {
    return NextResponse.json({ message: "Missing upload path" }, { status: 400 });
  }

  const filePath = path.join("/");
  const url = `${backend}/uploads/${filePath}`;

  const res = await fetch(url, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    status: res.status,
    headers: { "content-type": contentType },
  });
}
