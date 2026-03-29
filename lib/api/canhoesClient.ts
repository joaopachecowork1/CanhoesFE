"use client";

/**
 * Very small fetch wrapper for the Canhoes backend (via /api/proxy/*).
 *
 * Goals:
 * - Junior-friendly
 * - Keep feature calls strict by default
 * - Still allow explicit nullable bootstrap flows where 401/403 are expected
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

/**
 * Shared low-level request helper for the proxy-backed Canhoes API.
 *
 * Most feature repositories should use the strict `canhoesFetch()` variant so
 * 401/403 remain observable. Only auth/bootstrap flows should opt into the
 * nullable helper.
 */
async function requestCanhoes<T>(
  path: string,
  init: CanhoesRequestInit | undefined,
  allowUnauthorizedNull: boolean
): Promise<T | null> {
  const normalized = normalizePath(path);
  if (!normalized) {
    throw new ApiError("Invalid API path: path cannot be empty", 400);
  }

  const proxyUrl = `/api/proxy/${normalized}`;

  const headers = new Headers(init?.headers || {});
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // remove custom key before passing to fetch
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { headers: _ignoredHeaders, canhoes, ...restInit } = init || {};

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

  const throwOnUnauthorized = Boolean(canhoes?.throwOnUnauthorized);
  if (isUnauthorizedStatus(res.status) && allowUnauthorizedNull && !throwOnUnauthorized) {
    return null;
  }

  throw new ApiError(msg, res.status, details);
}

/**
 * Strict API fetch for authenticated feature calls.
 *
 * Unlike the historical wrapper, this does not silently coerce 401/403 into a
 * `null` payload. The caller must either catch the error or use the nullable
 * variant intentionally.
 */
export async function canhoesFetch<T>(path: string, init?: CanhoesRequestInit): Promise<T> {
  const result = await requestCanhoes<T>(path, init, false);
  return result as T;
}

/**
 * Nullable fetch for bootstrap flows that may legitimately run before auth is
 * fully hydrated, such as `/api/me`.
 */
export async function canhoesFetchNullable<T>(
  path: string,
  init?: CanhoesRequestInit
): Promise<T | null> {
  return requestCanhoes<T>(path, init, true);
}
