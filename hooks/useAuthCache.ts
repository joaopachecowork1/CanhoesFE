"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Response shape returned by the frontend `/api/me` route, which mirrors the
 * backend authenticated profile.
 */
export type MeResponse = {
  user?: {
    id: string;
    email: string;
    displayName?: string;
    isAdmin: boolean;
  } | null;
};

/**
 * Keep backend auth hydration short-lived but shared across components.
 */
const ME_CACHE_TTL_MS = 15_000; // 15 segundos

/**
 * Module-scoped cache to avoid stampeding `/api/me` when multiple consumers
 * mount during the same auth bootstrap.
 */
let meInFlight: Promise<MeResponse | null> | null = null;
let meCache: MeResponse | null = null;
let meCacheTs = 0;

/**
 * Fetch `/api/me` at most once per cache window.
 */
async function fetchMeOnce(): Promise<MeResponse | null> {
  const now = Date.now();

  if (meCache && now - meCacheTs < ME_CACHE_TTL_MS) {
    return meCache;
  }

  if (meInFlight) {
    return meInFlight;
  }

  meInFlight = (async () => {
    try {
      const response = await fetch("/api/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403 || response.status === 404) {
        return { user: null };
      }

      if (!response.ok) {
        throw new Error(`Failed to load /api/me (${response.status})`);
      }

      const text = await response.text();
      const normalized = text ? (JSON.parse(text) as MeResponse) : null;
      meCache = normalized;
      meCacheTs = Date.now();
      return normalized;
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Auth bootstrap failed", err);
      }

      return { user: null };
    }
  })().finally(() => {
    meInFlight = null;
  });

  return meInFlight;
}

/**
 * Small hook around the shared `/api/me` cache.
 */
export function useAuthCache() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(false);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchMeOnce();
      if (!abortRef.current) {
        setData(result);
      }
    } finally {
      if (!abortRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const clearCache = useCallback(() => {
    meCache = null;
    meCacheTs = 0;
    meInFlight = null;
    setData(null);
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  return {
    data,
    loading,
    refresh: fetchMe,
    clearCache,
  };
}

/**
 * Exporta para compatibilidade
 */
export { fetchMeOnce };
