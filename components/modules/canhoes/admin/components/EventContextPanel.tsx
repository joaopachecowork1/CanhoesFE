"use client";

import { CalendarClock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminCopy } from "@/lib/canhoesCopy";
import type { EventSummaryDto } from "@/lib/api/types";

type EventContextPanelProps = {
  activeEventName: string | null;
  busy: boolean;
  eventId: string | null;
  events: EventSummaryDto[];
  onActivateEvent: (eventId: string) => void;
};

export function EventContextPanel({
  activeEventName,
  busy,
  eventId,
  events,
  onActivateEvent,
}: Readonly<EventContextPanelProps>) {
  return (
    <Card className="border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2 text-[var(--accent-purple-soft)]">
          <CalendarClock className="h-4 w-4" />
          <span className="label">{adminCopy.state.contextKicker}</span>
        </div>
        <CardTitle>{adminCopy.state.contextTitle}</CardTitle>
        <p className="body-small text-[var(--beige)]/72">
          {adminCopy.state.contextDescription}
        </p>
      </CardHeader>

      <CardContent className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-2">
          <p className="label text-[var(--beige)]/68">
            {adminCopy.state.activeEventLabel}
          </p>
          <Select
            value={eventId ?? ""}
            onValueChange={onActivateEvent}
            disabled={busy || events.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolher evento" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-3 py-3">
          <p className="label text-[var(--bark)]/62">
            {adminCopy.state.currentEditionLabel}
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-ink)]">
            {activeEventName ?? adminCopy.controlStrip.activeEventFallback}
          </p>
          <p className="mt-1 text-xs text-[var(--bark)]/72">
            {adminCopy.state.currentEditionDescription}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
