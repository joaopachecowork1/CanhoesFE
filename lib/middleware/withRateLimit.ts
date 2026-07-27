import { NextResponse } from "next/server";

type RateLimitPolicy = "strict" | "standard" | "default";

const POLICY_LIMITS: Record<RateLimitPolicy, { requests: number; windowMs: number }> = {
  strict: { requests: 5, windowMs: 10_000 },
  standard: { requests: 20, windowMs: 10_000 },
  default: { requests: 100, windowMs: 10_000 },
};

const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(policy: RateLimitPolicy, req: Request): NextResponse | null {
  const { requests, windowMs } = POLICY_LIMITS[policy];
  const ip = getClientIp(req);
  const now = Date.now();

  const record = ipRequestCounts.get(ip);
  if (!record || record.resetAt < now) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (record.count >= requests) {
    return NextResponse.json(
      { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  record.count++;
  return null;
}

export function strictRateLimit(req: Request) {
  return checkRateLimit("strict", req);
}

export function standardRateLimit(req: Request) {
  return checkRateLimit("standard", req);
}

export function withRateLimit(
  policy: RateLimitPolicy,
  handler: (req: Request, ctx: Record<string, unknown>) => Promise<NextResponse> | NextResponse
) {
  return async (req: Request, ctx: Record<string, unknown>) => {
    const { requests, windowMs } = POLICY_LIMITS[policy];
    const ip = getClientIp(req);
    const now = Date.now();

    const record = ipRequestCounts.get(ip);
    if (!record || record.resetAt < now) {
      ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs });
      return handler(req, ctx);
    }

    if (record.count >= requests) {
      return NextResponse.json(
        { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    record.count++;
    return handler(req, ctx);
  };
}
