import { canhoesFetch } from "@/lib/api/canhoesClient";
import type * as T from "@/lib/api/types";

export const canhoesEventsRepo = {
  getActiveContext: () => canhoesFetch<T.EventActiveContextDto>("/v1/events/active/context"),
  getEventHomeSnapshot: (eventId: string) => canhoesFetch<T.EventHomeSnapshotDto>(`/v1/events/${eventId}/home-snapshot`),
};
