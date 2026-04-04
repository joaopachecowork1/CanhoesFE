"use client";

import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { EventOverviewDto, EventSummaryDto } from "@/lib/api/types";
import { REFRESH_EVENT_OVERVIEW_EVENT, pickActiveEvent } from "@/lib/canhoesEvent";
import { getErrorMessage } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

/**
 * Loads the active event plus its overview in one place so chrome, admin and
 * other phase-aware screens do not duplicate the same bootstrap logic.
 * Uses TanStack Query to deduplicate requests across components.
 */
export function useEventOverview() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["eventOverview"],
    queryFn: async () => {
      try {
        const events = await canhoesEventsRepo.listEvents();
        const activeEvent = pickActiveEvent(events);

        if (!activeEvent) {
          return { event: null, overview: null };
        }

        const overview = await canhoesEventsRepo.getEventOverview(activeEvent.id);
        return { event: activeEvent, overview };
      } catch (err) {
        throw new Error(
          getErrorMessage(err, "Nao foi possivel carregar o contexto do evento.", {
            404: "Nao existe um evento ativo para abrir agora.",
          })
        );
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  useEffect(() => {
    const handleRefresh = () => {
      void queryClient.invalidateQueries({ queryKey: ["eventOverview"] });
    };

    window.addEventListener(REFRESH_EVENT_OVERVIEW_EVENT, handleRefresh);
    return () => window.removeEventListener(REFRESH_EVENT_OVERVIEW_EVENT, handleRefresh);
  }, [queryClient]);

  return {
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    event: data?.event ?? null,
    isLoading,
    overview: data?.overview ?? null,
    refresh,
  };
}
