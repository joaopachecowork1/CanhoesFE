import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthorizationError } from "@/lib/auth/serverAuth";

type AuthHandler = (
  req: NextRequest,
  ctx: { params: Promise<Record<string, string | string[]>>; session: SessionContext }
) => Promise<NextResponse> | NextResponse;

type SessionContext = {
  userId: string;
  isAdmin: boolean;
  idToken?: string;
};

export function withAuth(handler: AuthHandler) {
  return async (req: NextRequest, ctx: { params: Promise<Record<string, string | string[]>> }) => {
    try {
      const user = await requireUser();
      return handler(req, {
        ...ctx,
        session: { userId: user.id, isAdmin: user.isAdmin },
      });
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json(
          { code: error.code, message: error.message },
          { status: error.status }
        );
      }
      throw error;
    }
  };
}
