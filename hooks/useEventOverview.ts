"use client";

import { useCallback, useEffect, useState } from "react";

import type { EventOverviewDto, EventSummaryDto } from "@/lib/api/types";
import { REFRESH_EVENT_OVERVIEW_EVENT, pickActiveEvent } from "@/lib/canhoesEvent";
import { getErrorMessage } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

type EventOverviewState = {
  error: Error | null;
  event: EventSummaryDto | null;
  isLoading: boolean;
  overview: EventOverviewDto | null;
};

const EMPTY_STATE: EventOverviewState = {
  error: null,
  event: null,
  isLoading: false,
  overview: null,
};

/**
 * Loads the active event plus its overview in one place so chrome, admin and
 * other phase-aware screens do not duplicate the same bootstrap logic.
 */
export function useEventOverview() {
  const [state, setState] = useState<EventOverviewState>({
    ...EMPTY_STATE,
    isLoading: true,
  });

  const refresh = useCallback(async () => {
    setState((currentState) => ({
      ...currentState,
      error: null,
      isLoading: true,
    }));

    try {
      const events = await canhoesEventsRepo.listEvents();
      const activeEvent = pickActiveEvent(events);

      if (!activeEvent) {
        setState(EMPTY_STATE);
        return;
      }

      const overview = await canhoesEventsRepo.getEventOverview(activeEvent.id);
      setState({
        error: null,
        event: activeEvent,
        isLoading: false,
        overview,
      });
    } catch (error) {
      setState({
        error: new Error(
          getErrorMessage(
            error,
            "Nao foi possivel carregar o contexto do evento.",
            {
              404: "Nao existe um evento ativo para abrir agora.",
            }
          )
        ),
        event: null,
        isLoading: false,
        overview: null,
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const handleRefresh = () => {
      void refresh();
    };

    window.addEventListener(REFRESH_EVENT_OVERVIEW_EVENT, handleRefresh);
    return () => window.removeEventListener(REFRESH_EVENT_OVERVIEW_EVENT, handleRefresh);
  }, [refresh]);

  return {
    ...state,
    refresh,
  };
}
