"use client";

import { DEV_AUTH_AUTO_ADMIN_ENABLED, DEV_AUTH_BYPASS_ENABLED } from "@/lib/auth/devAuth";

export function DevAuthModeBanner() {
  if (!DEV_AUTH_BYPASS_ENABLED) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[90] rounded-full border border-[rgba(255,209,102,0.42)] bg-[rgba(56,34,10,0.92)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(255,236,188,0.95)] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      DEV AUTH BYPASS {DEV_AUTH_AUTO_ADMIN_ENABLED ? "· ADMIN" : "· USER"}
    </div>
  );
}
