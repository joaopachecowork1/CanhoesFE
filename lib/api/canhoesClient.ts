"use client";

/**
 * Fetch wrapper for the Canhoes backend (proxied via Next.js /api/proxy/*).
 *
 * Features:
 * - Auto-deduplicates GET requests to prevent duplicate backend calls
 * - Safe 401/403 handling (returns null instead of throwing, to avoid crash on bootstrap)
 * - Retry with exponential backoff for 5xx/429 responses
 * - Supports strict auth mode when needed via { canhoes: { throwOnUnauthorized: true } }
 * - Accepts an optional AbortSignal from TanStack Query for cancellation on unmount
 */

export const CANHOES_API_URL =
  process.env.NEXT_PUBLIC_CANHOES_API_URL || "http://localhost:5000";

import { API_TIMEOUT_MS } from "@/lib/api/config";

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 1,
  initialDelayMs: 350,
  maxDelayMs: 1200,
  retryableStatusCodes: [429, 500, 502, 503, 504],
};

/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(
  attempt: number,
  error: Error & { status?: number; retryAfter?: string }
): number {
  const baseDelay = RETRY_CONFIG.initialDelayMs;
  const maxDelay = RETRY_CONFIG.maxDelayMs;

  let delay = baseDelay * Math.pow(2, attempt - 1);

  // Respect Retry-After header if present
  if (error.retryAfter) {
    try {
      const retryAfterMs = parseInt(error.retryAfter, 10);
      if (!isNaN(retryAfterMs)) {
        delay = Math.max(delay, retryAfterMs);
      }
    } catch {
      // Invalid retry-after header, ignore
    }
  }

  // Jitter: add random variation (±10%)
  const jitter = (Math.random() - 0.5) * 0.2 * delay;
  delay = Math.min(delay + jitter, maxDelay);

  return Math.max(delay, 100); // Minimum 100ms delay
}

/**
 * Create a retry wrapper for fetch requests
 */
async function withRetry<T>(
  fetchFn: () => Promise<T>,
  attempt = 1,
  lastError?: unknown
): Promise<T> {
  if (attempt > RETRY_CONFIG.maxRetries) {
    throw lastError ?? new ApiError("Max retries exceeded", 0);
  }

  try {
    return await fetchFn();
  } catch (error) {
    const err = error as Error & { status?: number };

    // Check if error is retryable
    const status = err.status || 0;
    const isRetryable = RETRY_CONFIG.retryableStatusCodes.includes(status);

    // Also check for rate limit header
    if (error instanceof Response && error.headers.has("Retry-After")) {
      const retryAfter = error.headers.get("Retry-After");
      if (retryAfter) {
        const delay = parseInt(retryAfter, 10);
        if (!isNaN(delay)) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          return withRetry(fetchFn, attempt + 1, error) as T;
        }
      }
    }

    // Only retry on specific status codes
    if (!isRetryable || status >= 400 && status < 500) {
      throw error;
    }

    const delay = calculateRetryDelay(attempt, err);
    await new Promise((resolve) => setTimeout(resolve, delay));

    return withRetry(fetchFn, attempt + 1, error);
  }
}

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
  /** Optional AbortSignal from the caller (e.g. TanStack Query's queryFn signal). */
  signal?: AbortSignal;
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

// Track consecutive 401s to detect expired sessions
let consecutive401Count = 0;
const MAX_CONSECUTIVE_401S = 3;



// Pending GET requests for deduplication
const pendingGetRequests = new Map<string, Promise<unknown>>();
const PENDING_MAX_AGE_MS = 30_000; // Clean up pending promises older than 30s

// Clean up stale pending promises periodically (they should resolve quickly)
setInterval(() => {
  // Pending promises that haven't resolved are likely stuck — clear them
  // This is safe because the finally block in fetchPromise should delete them
  // If they're still here, something went wrong and we should free the memory
  if (pendingGetRequests.size > 100) {
    // If we somehow have more than 100 pending, clear all (they're likely stuck)
    pendingGetRequests.clear();
  }
}, PENDING_MAX_AGE_MS);

function getDeduplicationKey(path: string, init?: CanhoesRequestInit): string | null {
  const method = (init?.method || "GET").toUpperCase();
  if (method !== "GET") return null;
  if (init?.canhoes?.skipDeduplication) return null;

  const normalized = normalizePath(path);
  return `GET:${normalized}`;
}

/**
 * Creates an AbortController that automatically aborts after the given timeout.
 * Returns the signal and a cleanup function.
 */
function createTimeoutSignal(timeoutMs: number): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timerId),
  };
}

/**
 * Fetch wrapper with automatic timeout and optional external AbortSignal.
 * The request is aborted when either the timeout fires or the external signal fires.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number = API_TIMEOUT_MS,
  externalSignal?: AbortSignal
): Promise<Response> {
  const { signal: timeoutSignal, cleanup } = createTimeoutSignal(timeoutMs);
  const signal =
    externalSignal ? AbortSignal.any([timeoutSignal, externalSignal]) : timeoutSignal;

  try {
    const response = await fetch(url, {
      ...init,
      signal,
    });
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        `O pedido demorou demasiado (> ${timeoutMs / 1000}s). Tenta novamente.`,
        408 // Request Timeout
      );
    }
    throw error;
  } finally {
    cleanup();
  }
}

/**
 * Fetches data from the Canhoes backend via proxy with retry and deduplication.
 *
 * Default behavior:
 * - Returns null on 401/403 (doesn't throw, to avoid crash on bootstrap)
 * - Throws ApiError on other failures
 * - Deduplicates GET requests automatically
 * - Retries failed requests with exponential backoff
 * - Accepts an optional AbortSignal for cancellation on component unmount
 *
 * For strict auth on 401/403, pass { canhoes: { throwOnUnauthorized: true } }
 */
export async function canhoesFetch<T>(
  path: string,
  init?: CanhoesRequestInit
): Promise<T> {
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
  const { headers: _ignoredHeaders, canhoes, signal: externalSignal, ...restInit } = init || {};

  // Check for pending identical GET request
  const dedupKey = getDeduplicationKey(path, init);
  if (dedupKey && pendingGetRequests.has(dedupKey)) {
    return pendingGetRequests.get(dedupKey) as Promise<T>;
  }

  const fetchPromise = (async () => {
    try {
      const res = await withRetry(() =>
        fetchWithTimeout(
          proxyUrl,
          {
            ...restInit,
            headers,
            credentials: "include",
            cache: "no-store",
          },
          API_TIMEOUT_MS,
          externalSignal
        )
      );

      if (res.ok) {
        consecutive401Count = 0;
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
        consecutive401Count += 1;
        if (consecutive401Count >= MAX_CONSECUTIVE_401S) {
          // Session likely expired — redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/canhoes/login?error=SessionExpired";
          }
        }
        return null as unknown as T;
      }

      // Reset counter on any successful (non-401) response
      consecutive401Count = 0;

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
