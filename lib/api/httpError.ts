/**
 * An error that a route handler turns into a `{ code, message }` JSON response with `status`
 * (see `apiRoute`). Domain errors that callers can act on extend it, so services stay free of
 * response handling.
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function badRequest(message: string, details?: unknown) {
  return new HttpError(400, "VALIDATION_ERROR", message, details);
}

export function unauthorized() {
  return new HttpError(401, "UNAUTHORIZED", "Authentication required.");
}

export function notFound(message: string) {
  return new HttpError(404, "NOT_FOUND", message);
}
