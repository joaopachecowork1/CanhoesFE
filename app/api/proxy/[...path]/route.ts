import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function handler(_req: NextRequest) {
  return NextResponse.json(
    { code: "NOT_IMPLEMENTED", message: "All routes have been migrated to native handlers. The proxy is no longer available." },
    { status: 501 }
  );
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
