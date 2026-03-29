"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useAuthCache } from "@/hooks/useAuthCache";

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
  loginGoogle: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { data: me, loading: meLoading, refresh, clearCache } = useAuthCache();
  const sessionIdentity = session?.user?.email ?? null;

  useEffect(() => {
    if (status === "authenticated") {
      clearCache();
      void refresh();
      return;
    }

    clearCache();
  }, [clearCache, refresh, sessionIdentity, status]);

  const sessionUser = useMemo<
    | {
        email?: string | null;
        id?: string | null;
        isAdmin?: boolean | null;
        name?: string | null;
      }
    | undefined
  >(() => {
    if (status !== "authenticated") return undefined;

    return session?.user as
      | {
          email?: string | null;
          id?: string | null;
          isAdmin?: boolean | null;
          name?: string | null;
        }
      | undefined;
  }, [session?.user, status]);

  const user = useMemo<AuthUser | null>(() => {
    if (!sessionUser) return null;

    const backendUser = me?.user;

    return {
      id: backendUser?.id || sessionUser.id || "unknown",
      email: backendUser?.email || sessionUser.email || "",
      name:
        backendUser?.displayName ||
        sessionUser.name ||
        sessionUser.email?.split("@")[0] ||
        "",
      // The backend `/api/me` profile is the authority for admin role.
      isAdmin: Boolean(backendUser?.isAdmin ?? sessionUser.isAdmin),
    };
  }, [me?.user, sessionUser]);

  const loading = status === "loading" || (status === "authenticated" && meLoading && !me);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLogged: status === "authenticated",
      loading,
      loginGoogle: () => signIn("google"),
      logout: () => signOut({ callbackUrl: "/canhoes/login", redirect: true }),
    }),
    [loading, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
