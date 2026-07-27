"use client";

import { useAuth } from "@/contexts/AuthContext";
import { resolveAdminStatus } from "@/lib/auth/adminStatus";

/**
 * Unified admin status hook.
 *
 * The authenticated profile returned by `/api/me` is the only source of truth.
 */
export function useAdminStatus() {
  const { isLogged, loading, profileError, profileLoading, user } = useAuth();
  return resolveAdminStatus({
    authLoading: loading,
    isLogged,
    profileError,
    profileLoading,
    userIsAdmin: Boolean(user?.isAdmin),
  });
}
