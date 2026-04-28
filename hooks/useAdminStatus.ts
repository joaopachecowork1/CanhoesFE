"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEventOverview } from "@/hooks/useEventOverview";
import { resolveAdminStatus } from "@/lib/auth/adminStatus";

/**
 * Unified admin status hook.
 *
 * Primary source: `/api/me`.
 * Fallback/context confirmation: `overview.permissions.isAdmin`.
 */
export function useAdminStatus() {
  const { isLogged, loading, profileError, profileLoading, user } = useAuth();
  const { error, isLoading: overviewLoading, overview } = useEventOverview();

  return resolveAdminStatus({
    authLoading: loading,
    eventOverviewError: error,
    eventOverviewLoading: overviewLoading,
    isLogged,
    overviewIsAdmin: Boolean(overview?.permissions.isAdmin),
    profileError,
    profileLoading,
    userIsAdmin: Boolean(user?.isAdmin),
  });
}
