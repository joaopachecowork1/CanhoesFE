import { NextRequest, NextResponse } from "next/server";

type TelemetryBody = {
  level?: string;
  message?: string;
  error?: string;
  url?: string;
  timestamp?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: TelemetryBody = await request.json();
    const { level, message, error, url, timestamp } = body;

    const prefix = `[TELEMETRY ${level?.toUpperCase() ?? "LOG"}]`;

    if (level === "error") {
      console.error(`${prefix} ${message}`, { error, url, timestamp });
    } else if (level === "warn") {
      console.warn(`${prefix} ${message}`, { url, timestamp });
    } else {
      console.log(`${prefix} ${message}`, { url, timestamp });
    }
  } catch {
    console.error("[TELEMETRY] Failed to parse telemetry payload");
  }

  return NextResponse.json({ ok: true });
}
