import { NextResponse } from "next/server";

export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ code, message }, { status });
}

export function unauthorized(msg = "Authentication required.") {
  return apiError("UNAUTHORIZED", msg, 401);
}

export function forbidden(msg = "Access denied.") {
  return apiError("FORBIDDEN", msg, 403);
}

export function notFound(msg = "Resource not found.") {
  return apiError("NOT_FOUND", msg, 404);
}

export function notImplemented(msg = "Route not yet migrated to native handler.") {
  return apiError("NOT_IMPLEMENTED", msg, 501);
}

export function badRequest(msg: string) {
  return apiError("BAD_REQUEST", msg, 400);
}
