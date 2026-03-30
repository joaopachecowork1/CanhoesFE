"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { adminCopy } from "@/lib/canhoesCopy";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import type { EventAdminStateDto, EventPhaseDto, EventSummaryDto } from "@/lib/api/types";

import { EventConfigurationPanel } from "./EventConfigurationPanel";
import { EventContextPanel } from "./EventContextPanel";

type EventStateCardProps = {
  activeEventName: string | null;
  eventId: string | null;
  events: EventSummaryDto[];
  onActivateEvent: (eventId: string) => Promise<void>;
  onUpdate: () => Promise<void>;
  state: EventAdminStateDto | null;
};

export function EventStateCard({
  activeEventName,
  eventId,
  events,
  onActivateEvent,
  onUpdate,
  state,
}: Readonly<EventStateCardProps>) {
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const updatePhase = async (phaseType: EventPhaseDto["type"]) => {
    if (!eventId) return;

    setBusyKey("phase");
    try {
      await canhoesEventsRepo.updateAdminPhase(eventId, { phaseType });
      await onUpdate();
      toast.success("Fase da edicao atualizada");
    } catch {
      toast.error("Nao foi possivel mudar a fase");
    } finally {
      setBusyKey(null);
    }
  };

  const activateEvent = async (nextEventId: string) => {
    if (!nextEventId || nextEventId === eventId) return;

    setBusyKey("event");
    try {
      await onActivateEvent(nextEventId);
    } finally {
      setBusyKey(null);
    }
  };

  if (!state) {
    return (
      <Card className="border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
        <CardContent className="py-6 text-sm text-[var(--beige)]/76">
          {adminCopy.state.noState}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <EventContextPanel
        activeEventName={activeEventName}
        busy={busyKey === "event"}
        eventId={eventId}
        events={events}
        onActivateEvent={(nextEventId) => void activateEvent(nextEventId)}
      />
      <EventConfigurationPanel
        busy={busyKey === "phase"}
        onUpdatePhase={(phaseType) => void updatePhase(phaseType)}
        state={state}
        visibleModulesCount={Object.values(state.effectiveModules).filter(Boolean).length}
      />
    </div>
  );
}
