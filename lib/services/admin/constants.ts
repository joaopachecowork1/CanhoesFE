import type { EventPhaseDto, EventSummaryDto } from "@/lib/api/types";

export const KindUserVote = 1;
export const KindSticker = 0;

export function toPhaseDto(phase: { id: string; type: string; startDateUtc: Date; endDateUtc: Date; isActive: boolean }): EventPhaseDto {
  return {
    id: phase.id,
    type: phase.type,
    startDateUtc: phase.startDateUtc.toISOString(),
    endDateUtc: phase.endDateUtc.toISOString(),
    isActive: phase.isActive,
  };
}

export function toEventSummary(event: { id: string; name: string; isActive: boolean }): EventSummaryDto {
  return { id: event.id, name: event.name, isActive: event.isActive };
}
