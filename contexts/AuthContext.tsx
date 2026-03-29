"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

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

type MeResponse = {
  user?: {
    id: string;
    email: string;
    displayName?: string | null;
    isAdmin: boolean;
  } | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [backendUser, setBackendUser] = useState<AuthUser | null>(null);
  const [isHydratingBackendUser, setIsHydratingBackendUser] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setBackendUser(null);
      setIsHydratingBackendUser(false);
      return;
    }

    const controller = new AbortController();
    setBackendUser(null);
    setIsHydratingBackendUser(true);

    async function hydrateBackendUser() {
      try {
        const response = await fetch("/api/me", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          setBackendUser(null);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to load /api/me (${response.status})`);
        }

        const payload = (await response.json()) as MeResponse;
        const nextUser = payload.user;

        setBackendUser(
          nextUser
            ? {
                id: nextUser.id,
                email: nextUser.email,
                name: nextUser.displayName || nextUser.email,
                isAdmin: Boolean(nextUser.isAdmin),
              }
            : null
        );
      } catch (error) {
        if ((error as { name?: string }).name !== "AbortError") {
          setBackendUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsHydratingBackendUser(false);
        }
      }
    }

    void hydrateBackendUser();

    return () => controller.abort();
  }, [session?.idToken, status]);

  const user = useMemo<AuthUser | null>(() => {
    if (status !== "authenticated") return null;

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
  }, [backendUser, session?.user, status]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLogged: status === "authenticated",
      loading: status === "loading" || (status === "authenticated" && isHydratingBackendUser),
      loginGoogle: () => signIn("google"),
      logout: () => signOut({ callbackUrl: "/canhoes/login", redirect: true }),
    }),
    [isHydratingBackendUser, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
