"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { getErrorMessage } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

export function useEventOverview() {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["eventOverview"],
    queryFn: () => canhoesEventsRepo.getActiveContext(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  let resolvedError: Error | null = null;
  if (error instanceof Error) {
    resolvedError = error;
  } else if (error) {
    resolvedError = new Error(String(error));
  }

  return {
    error: resolvedError,
    event: data?.event ?? null,
    isLoading,
    isFetching,
    overview: data?.overview ?? null,
    refresh,
  };
}
