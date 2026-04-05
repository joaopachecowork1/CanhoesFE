import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { DEV_AUTH_BYPASS_ENABLED, DEV_AUTH_USER_CONFIG } from "@/lib/auth/devAuth";
import { IS_MOCK_MODE } from "@/lib/mock";
import { getMockResponse } from "@/lib/mock/mockFetch";

/**
 * Proxy to the backend (avoids CORS) + injects Google id_token.
 *
 * Frontend auth: NextAuth (Google).
 * Backend auth: expects Authorization: Bearer <Google id_token>.
 *
 * Note: This proxy allows unauthenticated GET requests to public endpoints.
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

async function handleProxyRequest(request: NextRequest, params: { path: string[] }, method: string) {
  try {
    if (!Array.isArray(params?.path) || params.path.length === 0) {
      return NextResponse.json({ message: "Missing proxy path" }, { status: 400 });
    }

    const proxyPath = params.path.join("/");

    if (IS_MOCK_MODE) {
      const mockProxyPath = `/${proxyPath}${request.nextUrl.search}`;
      const mockBody = method !== "GET" && method !== "DELETE" ? await request.text() : null;

      try {
        const payload = await getMockResponse(mockProxyPath, method, { body: mockBody });
        return NextResponse.json(payload ?? null, { status: 200 });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Mock request failed";
        const status = message.includes("Ja submeteste") ? 409 : 500;
        return NextResponse.json({ message }, { status });
      }
    }

    // Try to get idToken from JWT
    const token = await getToken({ req: request });
    let idToken = token?.idToken;

    console.log("[Proxy] getToken result:", {
      hasToken: !!token,
      hasIdToken: !!idToken,
      tokenEmail: token?.email,
      tokenSub: token?.sub,
    });

    // Fallback to server session
    if (!idToken) {
      const session = await getServerSession(authOptions);
      idToken = session?.idToken;
      
      console.log("[Proxy] getServerSession fallback:", {
        hasSession: !!session,
        hasIdToken: !!idToken,
        userEmail: session?.user?.email,
      });
    }

    const backendBase = process.env.CANHOES_API_URL || "http://localhost:5000";
    const backendUrl = `${backendBase}/api/${proxyPath}${request.nextUrl.search}`;

    // Build headers
    const headers = new Headers();

    // Add Authorization if we have idToken
    if (idToken) {
      headers.set("Authorization", `Bearer ${idToken}`);
      console.log("[Proxy] Authorization header set, token starts with:", idToken.substring(0, 50) + "...");
    } else if (DEV_AUTH_BYPASS_ENABLED) {
      // Dev-only identity forwarding so backend can upsert/resolve the mock user
      // without requiring Google OAuth credits during local development.
      headers.set("x-dev-auth-bypass", "true");
      headers.set("x-dev-user-id", DEV_AUTH_USER_CONFIG.id);
      headers.set("x-dev-user-email", DEV_AUTH_USER_CONFIG.email);
      headers.set("x-dev-user-name", DEV_AUTH_USER_CONFIG.name);
      headers.set("x-dev-user-admin", String(DEV_AUTH_USER_CONFIG.isAdmin));

      const devBackendToken = process.env.DEV_AUTH_BACKEND_TOKEN;
      if (devBackendToken) {
        headers.set("Authorization", `Bearer ${devBackendToken}`);
      }

      console.log("[Proxy] Dev auth bypass headers set for backend user sync", {
        devUserEmail: DEV_AUTH_USER_CONFIG.email,
        hasDevBackendToken: Boolean(devBackendToken),
      });
    } else {
      console.warn("[Proxy] NO ID TOKEN - request will likely fail auth");
    }

    // Forward content-type so backend can parse JSON or multipart properly.
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);

    let body: ArrayBuffer | undefined;
    if (method !== "GET" && method !== "DELETE") {
      body = await request.arrayBuffer();
    }

    console.log(`[Proxy] ${method} ${backendUrl}`, {
      hasToken: !!idToken,
      path: proxyPath,
      isAdmin: token?.isAdmin,
    });

    const response = await fetch(backendUrl, {
      method,
      headers,
      body: body ?? undefined,
    });

    console.log(`[Proxy] Response ${response.status} for ${proxyPath}`);

    if (DEV_AUTH_BYPASS_ENABLED && (response.status === 401 || response.status === 403)) {
      const mockProxyPath = `/${proxyPath}${request.nextUrl.search}`;
      const mockBody = method !== "GET" && method !== "DELETE" ? new TextDecoder().decode(body) : null;

      try {
        const payload = await getMockResponse(mockProxyPath, method, { body: mockBody });
        console.warn(`[Proxy] Backend returned ${response.status} for ${proxyPath}; serving dev mock fallback.`);
        return NextResponse.json(payload ?? null, {
          status: 200,
          headers: {
            "x-dev-auth-fallback": "mock",
          },
        });
      } catch (mockError) {
        console.error("[Proxy] Dev fallback failed", mockError);
      }
    }

    // 204 has no body by definition; passing a body causes NextResponse to throw.
    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "application/json",
        },
      });
    }

    const responseData = await response.text();
    return new NextResponse(responseData || null, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("[Proxy Error]", error);
    return NextResponse.json({ message: "Internal proxy error" }, { status: 500 });
  }
}
