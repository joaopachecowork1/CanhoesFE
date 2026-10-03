import { NextResponse, type NextRequest } from "next/server";
import type { ZodType } from "zod";

import { badRequest, HttpError } from "@/lib/api/httpError";
import { logger } from "@/lib/logger";

/**
 * Building blocks for route handlers in `app/api`.
 *
 *   export const GET = apiRoute<{ eventId: string }>(async (request, { eventId }) => {
 *     const user = await requireUser();
 *     const { skip, take } = readPaging(request);
 *     return json(await listSomething(eventId, skip, take));
 *   });
 *
 * Handlers throw an `HttpError` (lib/api/httpError) to stop with an error response; `apiRoute`
 * turns it into `{ code, message }` JSON. Anything else that is thrown becomes a logged 500.
 */

type RouteContext<Params> = { params: Promise<Params> };

export function apiRoute<Params = Record<string, never>>(
  handler: (request: NextRequest, params: Params) => Promise<Response>
) {
  return async (request: NextRequest, context: RouteContext<Params>) => {
    try {
      return await handler(request, await context.params);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

function toErrorResponse(error: unknown) {
  if (error instanceof HttpError) {
    const body = error.details === undefined
      ? { code: error.code, message: error.message }
      : { code: error.code, message: error.message, details: error.details };
    return NextResponse.json(body, { status: error.status });
  }

  logger.error("Unhandled API error", error);
  return NextResponse.json(
    { code: "UNHANDLED_SERVER_ERROR", message: "Unexpected server error." },
    { status: 500 }
  );
}

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

/** Parses the JSON body with `schema`. Malformed JSON or invalid input becomes a 400. */
export async function readJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw badRequest("Invalid JSON body.");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Invalid input.", parsed.error.flatten());
  }
  return parsed.data;
}

/** The uploaded file in form field `field`, or a 400 when it is missing or empty. */
export async function readFormFile(request: Request, field = "file"): Promise<File> {
  const file = (await request.formData()).get(field);
  if (!(file instanceof File) || file.size <= 0) {
    throw new HttpError(400, "FILE_REQUIRED", "File is required.");
  }
  return file;
}

type PagingOptions = { defaultTake?: number; maxTake?: number };

/** `skip`/`take` from the query string: missing or invalid values fall back to the defaults, `take` is capped. */
export function readPaging(request: NextRequest, { defaultTake = 50, maxTake = 200 }: PagingOptions = {}) {
  const params = request.nextUrl.searchParams;
  const skip = parseInteger(params.get("skip")) ?? 0;
  const take = parseInteger(params.get("take")) ?? defaultTake;
  return {
    skip: Math.max(0, skip),
    take: Math.min(maxTake, Math.max(1, take)),
  };
}

function parseInteger(value: string | null) {
  if (value === null) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
