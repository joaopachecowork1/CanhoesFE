"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEventOverview } from "@/hooks/useEventOverview";

/**
 * Unified admin status hook.
 *
 * Combines two sources of admin truth:
 * 1. `user.isAdmin` from `/api/me` (fast after Phase 0 fix, < 1s)
 * 2. `overview.permissions.isAdmin` from the event overview (may load later)
 *
 * Always returns the most reliable admin status available at any moment.
 */
export function useAdminStatus() {
  const { user } = useAuth();
  const { overview } = useEventOverview();

  const isAdmin = Boolean(user?.isAdmin) || Boolean(overview?.permissions.isAdmin);

  return {
    isAdmin,
    isLoading: Boolean(user && !overview),
  };
}
