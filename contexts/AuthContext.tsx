"use client";

import React, { createContext, useContext, useMemo } from "react";
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
  isDevAuthBypass: boolean;
  loginGoogle: () => void;
  logout: () => void;
};

type MeResponse = {
  user?: {
    id: string;
    email: string;
    displayName?: string | null;
    isAdmin: boolean;
  } | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const devBypassUser = DEV_AUTH_BYPASS_ENABLED
    ? {
        id: DEV_AUTH_USER_CONFIG.id,
        email: DEV_AUTH_USER_CONFIG.email,
        name: DEV_AUTH_USER_CONFIG.name,
        isAdmin: DEV_AUTH_USER_CONFIG.isAdmin,
      }
    : null;
  const isDevAuthBypass = Boolean(devBypassUser);

  const { data: backendUser, isLoading: isHydratingBackendUser } = useQuery<AuthUser | null>({
    queryKey: ["auth", "me", session?.idToken],
    enabled: isAuthenticated && !isDevAuthBypass,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/me", { signal });
      if (response.status === 401 || response.status === 403) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`Failed to load /api/me (${response.status})`);
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
    if (!isAuthenticated) return null;

    const sessionUser = session?.user as
      | {
          email?: string | null;
          id?: string | null;
          isAdmin?: boolean | null;
          name?: string | null;
        }
      | undefined;

    return {
      id: backendUser?.id || sessionUser?.id || "unknown",
      email: backendUser?.email || sessionUser?.email || "",
      name:
        backendUser?.name ||
        sessionUser?.name ||
        sessionUser?.email?.split("@")[0] ||
        "",
      isAdmin: Boolean(backendUser?.isAdmin),
    };
  }, [backendUser, devBypassUser, session?.user, isAuthenticated]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLogged: isAuthenticated || isDevAuthBypass,
      loading: !isDevAuthBypass && status === "loading",
      profileLoading: !isDevAuthBypass && isAuthenticated && isHydratingBackendUser,
      isDevAuthBypass,
      loginGoogle: () => signIn("google"),
      logout: () => signOut({ callbackUrl: "/canhoes/login", redirect: true }),
    }),
    [isAuthenticated, isDevAuthBypass, status, isHydratingBackendUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
