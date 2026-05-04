import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { DEV_AUTH_BYPASS_ENABLED, DEV_AUTH_USER_CONFIG } from "@/lib/auth/devAuth";
import { IS_MOCK_MODE } from "@/lib/mock";
import { getMockResponse } from "@/lib/mock/mockFetch";
import { logger } from "@/lib/logger";
import { sanitizeErrorDetail } from "@/lib/errors";
import { API_TIMEOUT_MS } from "@/lib/api/config";

/**
 * Headers from the backend response that are safe to forward to the client.
 * Forwarding these allows the browser and Next.js edge cache to benefit from
 * backend cache hints (e.g. Cache-Control: public, max-age=30).
 */
const FORWARDED_RESPONSE_HEADERS = ["cache-control", "etag", "last-modified", "vary"] as const;


/**
 * Proxy to the backend (avoids CORS) + injects Google id_token.
 *
 * Frontend auth: NextAuth (Google).
 * Backend auth: expects Authorization: Bearer <Google id_token>.
 *
 * Note: This proxy allows unauthenticated GET requests to public endpoints.
 * Rate limiting is handled entirely by the backend ([EnableRateLimiting("standard")]).
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "GET");
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "POST");
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "PUT");
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "DELETE");
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "PATCH");
}

type ProxyErrorPayload = {
  code: string;
  message: string;
  detail?: string;
  traceId: string;
};

function createProxyErrorResponse(
  status: number,
  payload: Omit<ProxyErrorPayload, "traceId">,
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
        "x-proxy-error-code": payload.code,
      },
    }
  );
}

function hasRequestBody(method: string) {
  return method !== "GET" && method !== "DELETE";
}

async function resolveIdToken(request: NextRequest): Promise<string | undefined> {
  const token = await getToken({ req: request });
  if (!token) return undefined;
  if (!token.idToken) {
    logger.warn("[Proxy] JWT present but idToken is missing — check auth.ts jwt callback");
  }
  return token.idToken as string | undefined;
}

function buildBackendHeaders(request: NextRequest, idToken: string | undefined) {
  const headers = new Headers();

  if (idToken) {
    headers.set("Authorization", `Bearer ${idToken}`);
  } else if (DEV_AUTH_BYPASS_ENABLED) {
    headers.set("x-dev-auth-bypass", "true");
    headers.set("x-dev-user-id", DEV_AUTH_USER_CONFIG.id);
    headers.set("x-dev-user-email", DEV_AUTH_USER_CONFIG.email);
    headers.set("x-dev-user-name", DEV_AUTH_USER_CONFIG.name);
    headers.set("x-dev-user-admin", String(DEV_AUTH_USER_CONFIG.isAdmin));

    const devBackendToken = process.env.DEV_AUTH_BACKEND_TOKEN;
    if (devBackendToken) {
      headers.set("Authorization", `Bearer ${devBackendToken}`);
    }
  }

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  return headers;
}

function normalizeProxyPath(params: { path: string[] } | undefined) {
  if (!Array.isArray(params?.path) || params.path.length === 0) {
    return null;
  }

  return params.path.join("/");
}

async function handleMockRequest(
  request: NextRequest,
  proxyPath: string,
  method: string,
  traceId: string
) {
  const mockProxyPath = `/${proxyPath}${request.nextUrl.search}`;
  const mockBody = hasRequestBody(method) ? await request.text() : null;

  try {
    const payload = await getMockResponse(mockProxyPath, method, { body: mockBody });
    return NextResponse.json(payload ?? null, { status: 200 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Mock request failed";
    const status = detail.includes("Ja submeteste") ? 409 : 500;

    return createProxyErrorResponse(
      status,
      {
        code: "MOCK_REQUEST_FAILED",
        message: "Mock provider could not process the request.",
        detail,
      },
      traceId
    );
  }
}

async function forwardToBackend(request: NextRequest, proxyPath: string, method: string) {
  const idToken = await resolveIdToken(request);
  const backendBase = process.env.CANHOES_API_URL || "http://localhost:5000";
  const backendUrl = `${backendBase}/api/${proxyPath}${request.nextUrl.search}`;
  const headers = buildBackendHeaders(request, idToken);
  const body = hasRequestBody(method) ? await request.arrayBuffer() : undefined;

  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      const timeoutResponse = new Response(
        JSON.stringify({
          code: "BACKEND_TIMEOUT",
          message: "O servidor demorou demasiado a responder. Tenta novamente.",
        }),
        { status: 504, headers: { "Content-Type": "application/json" } }
      );
      return timeoutResponse;
    }
    throw error;
  } finally {
    clearTimeout(timerId);
  }
}

async function handleProxyRequest(request: NextRequest, params: { path: string[] }, method: string) {
  const traceId = request.headers.get("x-request-id") || crypto.randomUUID();
  const proxyPath = normalizeProxyPath(params);
  if (!proxyPath) {
    return createProxyErrorResponse(
      400,
      {
        code: "PROXY_PATH_MISSING",
        message: "Proxy path is missing.",
      },
      traceId
    );
  }

  const startMs = Date.now();

  try {
    if (IS_MOCK_MODE) {
      return handleMockRequest(request, proxyPath, method, traceId);
    }

    const response = await forwardToBackend(request, proxyPath, method);

    const duration = Date.now() - startMs;
    if (duration > 500) {
      logger.warn(`[PROXY-SLOW] ${method} /${proxyPath} — ${duration}ms`);
    }

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const forwardedHeaders: Record<string, string> = {
      "Content-Type": response.headers.get("Content-Type") || "application/json",
    };
    for (const header of FORWARDED_RESPONSE_HEADERS) {
      const value = response.headers.get(header);
      if (value) forwardedHeaders[header] = value;
    }

    const responseData = await response.text();
    return new NextResponse(responseData || null, {
      status: response.status,
      headers: forwardedHeaders,
    });
  } catch (error) {
    const duration = Date.now() - startMs;
    const detail = sanitizeErrorDetail(error instanceof Error ? error.message : String(error));
    const isBackendUnreachable =
      /fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|socket hang up/i.test(detail);

    if (duration > 500) {
      logger.warn(`[PROXY-SLOW] ${method} /${proxyPath} — ${duration}ms (error)`);
    }

    if (isBackendUnreachable) {
      return createProxyErrorResponse(
        502,
        {
          code: "PROXY_BACKEND_UNREACHABLE",
          message: "The API proxy could not reach the backend service.",
          detail,
        },
        traceId
      );
    }

    return createProxyErrorResponse(
      500,
      {
        code: "PROXY_UNHANDLED_ERROR",
        message: "The API proxy failed to process the request.",
        detail,
      },
      traceId
    );
  }
}
