"use client";

import { SecretSantaAdmin } from "./SecretSantaAdmin";
import { EventStateCard } from "./EventStateCard";
import { ModuleVisibilityAdmin } from "./ModuleVisibilityAdmin";
import type { EventAdminSecretSantaStateDto, EventAdminStateDto, EventSummaryDto } from "@/lib/api/types";

type AdminControlCenterProps = {
  activeEventName: string | null;
  eventId: string | null;
  events: EventSummaryDto[];
  eventState: EventAdminStateDto | null;
  secretSantaState: EventAdminSecretSantaStateDto | null;
  loading: boolean;
  onActivateEvent: (eventId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
};

export function AdminControlCenter({
  activeEventName,
  eventId,
  events,
  eventState,
  secretSantaState,
  loading,
  onActivateEvent,
  onRefresh,
}: Readonly<AdminControlCenterProps>) {
  return (
    <div className="space-y-4">
      <EventStateCard
        activeEventName={activeEventName}
        eventId={eventId}
        events={events}
        onActivateEvent={onActivateEvent}
        onUpdate={onRefresh}
        state={eventState}
      />

      <ModuleVisibilityAdmin eventId={eventId} onUpdate={onRefresh} state={eventState} />

      <SecretSantaAdmin
        activeEventName={activeEventName}
        eventId={eventId}
        loading={loading}
        onUpdate={onRefresh}
        state={secretSantaState}
      />
    </div>
  );
}









































































































































































































































































































































