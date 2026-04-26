"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { DEV_AUTH_BYPASS_ENABLED, DEV_AUTH_USER_CONFIG } from "@/lib/auth/devAuth";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  isLogged: boolean;
  loading: boolean;
  profileLoading: boolean;
  profileError: Error | null;
  isDevAuthBypass: boolean;
  loginGoogle: () => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

type MeResponse = {
  user?: {
    id: string;
    email: string;
    displayName?: string | null;
    isAdmin: boolean;
  } | null;
};

type ErrorResponse = {
  detail?: string;
  message?: string;
};

async function resolveAuthErrorMessage(response: Response) {
  const fallback = `Failed to load /api/me (${response.status})`;
  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as ErrorResponse;
      if (typeof payload?.message === "string" && payload.message.trim()) {
        return payload.message.trim();
      }

      if (typeof payload?.detail === "string" && payload.detail.trim()) {
        return payload.detail.trim();
      }

      return fallback;
    }

    const text = (await response.text()).trim();
    return text || fallback;
  } catch {
    return fallback;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const devBypassUser = useMemo<AuthUser | null>(() => (
    DEV_AUTH_BYPASS_ENABLED
      ? {
          id: DEV_AUTH_USER_CONFIG.id,
          email: DEV_AUTH_USER_CONFIG.email,
          name: DEV_AUTH_USER_CONFIG.name,
          isAdmin: DEV_AUTH_USER_CONFIG.isAdmin,
        }
      : null
  ), []);

  const isDevAuthBypass = Boolean(devBypassUser);

  const backendUserQuery = useQuery<AuthUser | null>({
    queryKey: ["auth", "me", session?.idToken],
    enabled: isLoggedIn && !isDevAuthBypass,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    retry: false,
    refetchOnReconnect: false,
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/me", { signal });
      if (!response.ok) {
        throw new Error(await resolveAuthErrorMessage(response));
      }

      const payload = (await response.json()) as MeResponse;
      const nextUser = payload.user;

      if (!nextUser) {
        return null;
      }

      return {
        id: nextUser.id,
        email: nextUser.email,
        name: nextUser.displayName || nextUser.email,
        isAdmin: Boolean(nextUser.isAdmin),
      };
    },
  });

  const user = useMemo<AuthUser | null>(() => {
    if (devBypassUser) return devBypassUser;
    if (!isLoggedIn) return null;

    const sessionUser = session?.user as
      | {
          email?: string | null;
          id?: string | null;
          isAdmin?: boolean | null;
          name?: string | null;
        }
      | undefined;

    return {
      id: backendUserQuery.data?.id || sessionUser?.id || "unknown",
      email: backendUserQuery.data?.email || sessionUser?.email || "",
      name:
        backendUserQuery.data?.name ||
        sessionUser?.name ||
        sessionUser?.email?.split("@")[0] ||
        "",
      isAdmin: Boolean(backendUserQuery.data?.isAdmin ?? sessionUser?.isAdmin),
    };
  }, [backendUserQuery.data, devBypassUser, session?.user, isLoggedIn]);

  const profileError = useMemo<Error | null>(() => {
    if (backendUserQuery.error instanceof Error) {
      return backendUserQuery.error;
    }

    if (backendUserQuery.error) {
      return new Error(String(backendUserQuery.error));
    }

    return null;
  }, [backendUserQuery.error]);

  const loginGoogle = useCallback(() => {
    void signIn("google", { callbackUrl: "/canhoes" });
  }, []);

  const logout = useCallback(() => {
    void signOut({ callbackUrl: "/canhoes/login", redirect: true });
  }, []);

  const refreshProfile = useCallback(async () => {
    await backendUserQuery.refetch();
  }, [backendUserQuery]);

  const isLoading = status === "loading";
  const isProfileLoading = backendUserQuery.isLoading;

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLogged: isLoggedIn || isDevAuthBypass,
      loading: !isDevAuthBypass && isLoading,
      profileLoading: !isDevAuthBypass && isLoggedIn && isProfileLoading,
      profileError,
      isDevAuthBypass,
      loginGoogle,
      logout,
      refreshProfile,
    }),
    [
      user,
      isLoggedIn,
      isDevAuthBypass,
      isLoading,
      isProfileLoading,
      profileError,
      loginGoogle,
      logout,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
