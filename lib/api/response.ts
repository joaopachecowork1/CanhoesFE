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

export function badRequest(msg: string) {
  return apiError("BAD_REQUEST", msg, 400);
}
