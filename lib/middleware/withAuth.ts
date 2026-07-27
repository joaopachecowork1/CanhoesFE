import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";

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
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Authentication required." },
        { status: 401 }
      );
    }

    const sessionContext: SessionContext = {
      userId: (session.user as Record<string, unknown>).id as string || "",
      isAdmin: Boolean((session.user as Record<string, unknown>).isAdmin),
      idToken: (session as unknown as Record<string, unknown>).idToken as string | undefined,
    };

    if (!sessionContext.userId) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "User ID not found in session." },
        { status: 401 }
      );
    }

    return handler(req, { ...ctx, session: sessionContext });
  };
}
