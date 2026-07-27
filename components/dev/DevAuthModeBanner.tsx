"use client";

import { useAuth } from "@/hooks/useAuth";

export function DevAuthModeBanner() {
  const { isDevAuthBypass, user } = useAuth();
  if (!isDevAuthBypass) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[90] rounded-full border border-[rgba(255,209,102,0.42)] bg-[rgba(56,34,10,0.92)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(255,236,188,0.95)] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      SESSÃO LOCAL {user?.isAdmin ? "· ADMIN" : "· USER"}
    </div>
  );
}
