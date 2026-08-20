import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/domains/auth/services/serverAuth";

type MeErrorPayload = {
  code: string;
  message: string;
  detail?: string;
  traceId: string;
};

function createErrorResponse(
  status: number,
  payload: Omit<MeErrorPayload, "traceId">,
  traceId: string
) {
  return NextResponse.json(
    { ...payload, traceId },
    {
      status,
      headers: { "x-auth-error-code": payload.code },
    }
  );
}

export async function GET(request: NextRequest) {
  const traceId = request.headers.get("x-request-id") || crypto.randomUUID();

  const user = await getRequestUser();
  if (!user) {
    return createErrorResponse(401, {
      code: "UNAUTHORIZED",
      message: "Authentication required.",
    }, traceId);
  }

  try {
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    return createErrorResponse(502, {
      code: "AUTH_DATABASE_UNREACHABLE",
      message: "Could not resolve user profile.",
      detail: error instanceof Error ? error.message : String(error),
    }, traceId);
  }
}
