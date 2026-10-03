/**
 * Simple logging utility for Next.js (client & server).
 * Prevents sensitive console.logs in production and sends critical errors to telemetry.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const IS_PROD = process.env.NODE_ENV === "production";

// Browser errors are forwarded to /api/telemetry/log; on the server, stdout already is the log.
async function sendToTelemetry(level: LogLevel, message: string, data?: unknown) {
  if (!IS_PROD || typeof window === "undefined") return;

  try {
    await fetch("/api/telemetry/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level,
        message,
        data,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
        /* fail silently to avoid infinite loops */
    });
  } catch {
    // Ignore errors in telemetry to prevent crashing the app
  }
}

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (!IS_PROD) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: unknown[]) => {
    if (!IS_PROD) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
    sendToTelemetry("warn", message, { args });
  },

  error: (message: string, error?: unknown, context?: unknown) => {
    console.error(`[ERROR] ${message}`, error, context);
    sendToTelemetry("error", message, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
    });
  },
};