import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { resolveUser } from "@/lib/services/authService";

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

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const idToken = token?.idToken as string | undefined;

  if (!idToken || !token) {
    return createErrorResponse(401, {
      code: "AUTH_ID_TOKEN_MISSING",
      message: "The Google session is missing the id_token required by the backend.",
    }, traceId);
  }

  try {
    const sub = token.sub ?? token.email;
    const email = token.email;
    if (!sub || !email) {
      return createErrorResponse(401, {
        code: "AUTH_CLAIMS_MISSING",
        message: "Missing required claims from the authentication token.",
      }, traceId);
    }

    const user = await resolveUser(sub, email, (token.name ?? null));

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
      code: "AUTH_BACKEND_UNREACHABLE",
      message: "Could not resolve user profile.",
      detail: error instanceof Error ? error.message : String(error),
    }, traceId);
  }
}
