import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

type AuthMeErrorPayload = {
  code: string;
  message: string;
  detail?: string;
  traceId: string;
};

function createAuthMeErrorResponse(
  status: number,
  payload: Omit<AuthMeErrorPayload, "traceId">,
  traceId: string
) {
  return NextResponse.json(
    {
      ...payload,
      traceId,
    },
    {
      status,
      headers: {
        "x-auth-error-code": payload.code,
      },
    }
  );
}

export async function GET(request: Request) {
  const traceId = request.headers.get("x-request-id") || crypto.randomUUID();
  const backend = process.env.CANHOES_API_URL || process.env.NEXT_PUBLIC_CANHOES_API_URL;
  if (!backend) {
    return createAuthMeErrorResponse(
      500,
      {
        code: "AUTH_BACKEND_URL_MISSING",
        message: "CANHOES_API_URL is not configured for this deployment.",
      },
      traceId
    );
  }

  const session = await getServerSession(authOptions);
  const idToken = session?.idToken;
  if (!idToken) {
    return createAuthMeErrorResponse(
      401,
      {
        code: "AUTH_ID_TOKEN_MISSING",
        message: "The Google session is missing the id_token required by the backend.",
      },
      traceId
    );
  }

  try {
    const res = await fetch(new URL("/api/me", backend).toString(), {
      headers: { Authorization: `Bearer ${idToken}` },
      cache: "no-store",
    });
    const responseBody = await res.text();

    if (!res.ok) {
      return createAuthMeErrorResponse(
        res.status,
        {
          code: "AUTH_PROFILE_FETCH_FAILED",
          message: "The backend rejected the authenticated session profile request.",
          detail: responseBody || undefined,
        },
        traceId
      );
    }

    return new NextResponse(responseBody, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") || "application/json" },
    });
  } catch (error) {
    return createAuthMeErrorResponse(
      502,
      {
        code: "AUTH_BACKEND_UNREACHABLE",
        message: "The auth profile endpoint could not reach the backend service.",
        detail: error instanceof Error ? error.message : String(error),
      },
      traceId
    );
  }
}
