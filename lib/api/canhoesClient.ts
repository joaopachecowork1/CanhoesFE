"use client";

/**
 * Fetch wrapper for the Canhoes backend (proxied via Next.js /api/proxy/*).
 * 
 * Features:
 * - Auto-deduplicates GET requests to prevent duplicate backend calls
 * - Safe 401/403 handling (returns null instead of throwing, to avoid crash on bootstrap)
 * - Supports strict auth mode when needed via { canhoes: { throwOnUnauthorized: true } }
 */

export const CANHOES_API_URL =
  process.env.NEXT_PUBLIC_CANHOES_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type CanhoesRequestInit = RequestInit & {
  canhoes?: {
    throwOnUnauthorized?: boolean;
    skipDeduplication?: boolean;
  };
};

function normalizePath(path: string) {
  let p = path.trim();
  if (p.startsWith("/")) p = p.slice(1);
  if (p.startsWith("api/")) p = p.slice(4);
  return p;
}

async function readBody(res: Response): Promise<unknown> {
  if (res.status === 204) return undefined;

  const text = await res.text();
  if (!text) return undefined;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

function isUnauthorizedStatus(status: number) {
  return status === 401 || status === 403;
}

// Pending GET requests for deduplication
const pendingGetRequests = new Map<string, Promise<unknown>>();

function getDeduplicationKey(path: string, init?: CanhoesRequestInit): string | null {
  const method = (init?.method || "GET").toUpperCase();
  if (method !== "GET") return null;
  if (init?.canhoes?.skipDeduplication) return null;

  const normalized = normalizePath(path);
  return `GET:${normalized}`;
}

/**
 * Fetches data from the Canhoes backend via proxy.
 * 
 * Default behavior:
 * - Returns null on 401/403 (doesn't throw, to avoid crash on bootstrap)
 * - Throws ApiError on other failures
 * - Deduplicates GET requests automatically
 * 
 * For strict auth on 401/403, pass { canhoes: { throwOnUnauthorized: true } }
 */
export async function canhoesFetch<T>(path: string, init?: CanhoesRequestInit): Promise<T> {
  const normalized = normalizePath(path);
  if (!normalized) {
    throw new ApiError("Invalid API path: path cannot be empty", 400);
  }

  const proxyUrl = `/api/proxy/${normalized}`;

  const headers = new Headers(init?.headers || {});
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Remove custom canhoes config before passing to fetch
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { headers: _ignoredHeaders, canhoes, ...restInit } = init || {};

  // Check for pending identical GET request
  const dedupKey = getDeduplicationKey(path, init);
  if (dedupKey && pendingGetRequests.has(dedupKey)) {
    return pendingGetRequests.get(dedupKey) as Promise<T>;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(proxyUrl, {
        ...restInit,
        headers,
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        return (await readBody(res)) as T;
      }

      const details = await readBody(res);
      const msg =
        typeof details === "object" && details !== null && "message" in details
          ? String((details as { message: unknown }).message)
          : res.statusText || "Request failed";

      // Default: don't crash on 401/403 (bootstrap loads safely)
      const throwOnUnauthorized = Boolean(canhoes?.throwOnUnauthorized);
      if (isUnauthorizedStatus(res.status) && !throwOnUnauthorized) {
        return null as unknown as T;
      }

      throw new ApiError(msg, res.status, details);
    } finally {
      if (dedupKey) {
        pendingGetRequests.delete(dedupKey);
      }
    }
  })();

  // Store pending GET request for deduplication
  if (dedupKey) {
    pendingGetRequests.set(dedupKey, fetchPromise);
  }

  return fetchPromise;
}
