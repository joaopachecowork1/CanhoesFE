import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

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

async function resolveIdToken(request: NextRequest) {
  const token = await getToken({ req: request });
  if (token?.idToken) {
    return token.idToken;
  }

  const session = await getServerSession(authOptions);
  return session?.idToken ?? null;
}

async function handleProxyRequest(request: NextRequest, params: { path: string[] }, method: string) {
  try {
    const idToken = await resolveIdToken(request);
    const path = params.path.join("/");
    const backendBase = process.env.CANHOES_API_URL || "http://localhost:5000";
    const backendUrl = `${backendBase}/api/${path}${request.nextUrl.search}`;

    const headers = new Headers();

    if (idToken) {
      headers.set("Authorization", `Bearer ${idToken}`);
    }

    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);

    let body: ArrayBuffer | undefined;
    if (method !== "GET" && method !== "DELETE") {
      body = await request.arrayBuffer();
    }

    const response = await fetch(backendUrl, {
      method,
      headers,
      body: body ?? undefined,
    });

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
    console.error("[Proxy Error]", {
      message: error instanceof Error ? error.message : "Unknown proxy failure",
      method,
      path: params.path.join("/"),
    });
    return NextResponse.json({ message: "Internal proxy error" }, { status: 500 });
  }
}
