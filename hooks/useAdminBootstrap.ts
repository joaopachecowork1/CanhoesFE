"use client";

import { useQuery } from "@tanstack/react-query";
import { adminRepo } from "@/lib/repositories/adminRepo";

export function useAdminBootstrap(eventId: string | null, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["adminBootstrap", eventId],
    queryFn: () => adminRepo.getBootstrap(eventId!, false),
    enabled: !!eventId && enabled,
    staleTime: 1000 * 30, // 30 seconds
  });

  return {
    events: data?.events ?? [],
    state: data?.state ?? null,
    summary: data?.counts ?? null,
    loading: isLoading,
    error,
    refetch,
  };
}
