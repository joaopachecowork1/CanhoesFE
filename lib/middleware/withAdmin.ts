import { NextResponse } from "next/server";

export function withAdmin(
  handler: (req: Request, ctx: Record<string, unknown>) => Promise<NextResponse> | NextResponse
) {
  return async (req: Request, ctx: Record<string, unknown>) => {
    const session = (ctx as { session?: { isAdmin?: boolean } }).session;

    if (!session?.isAdmin) {
      return NextResponse.json(
        { code: "FORBIDDEN", message: "Admin access required." },
        { status: 403 }
      );
    }

    return handler(req, ctx);
  };
}
