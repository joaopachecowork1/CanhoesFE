/**
 * Simple logging utility for Next.js (client & server).
 * Prevents sensitive console.logs in production and sends critical errors to telemetry.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const IS_PROD = process.env.NODE_ENV === "production";

async function sendToTelemetry(level: LogLevel, message: string, data?: any) {
  if (!IS_PROD) return;

  try {
    // Simple fire-and-forget telemetry call to our backend
    await fetch("/api/telemetry/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level,
        message,
        data,
        url: typeof window !== "undefined" ? window.location.href : "server",
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
  debug: (message: string, ...args: any[]) => {
    if (!IS_PROD) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    if (!IS_PROD) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
    sendToTelemetry("warn", message, args);
  },

  error: (message: string, error?: any, context?: any) => {
    console.error(`[ERROR] ${message}`, error, context);
    sendToTelemetry("error", message, { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context 
    });
  },
};
