"use client";

import { useState } from "react";
import { CalendarClock, RefreshCw, TimerReset } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminCopy } from "@/lib/canhoesCopy";
import { cn } from "@/lib/utils";
import type { EventAdminStateDto, EventPhaseDto, EventSummaryDto } from "@/lib/api/types";

import { AdminStateMessage } from "./AdminStateMessage";

type AdminPhaseSectionProps = {
  activeEventName: string | null;
  eventId: string | null;
  events: EventSummaryDto[];
  onActivateEvent: (eventId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  onUpdatePhase: (phaseType: EventPhaseDto["type"]) => Promise<void>;
  state: EventAdminStateDto | null;
};

function getPhaseLabel(phaseType?: string | null) {
  switch (phaseType) {
    case "DRAW":
      return "Sorteio";
    case "PROPOSALS":
      return "Propostas";
    case "VOTING":
      return "Votacao";
    case "RESULTS":
      return "Resultados";
    default:
      return "Sem fase";
  }
}

function formatPhaseWindow(phase: EventPhaseDto) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
  }).format(new Date(phase.endDate));
}

export function AdminPhaseSection({
  activeEventName,
  eventId,
  events,
  onActivateEvent,
  onRefresh,
  onUpdatePhase,
  state,
}: Readonly<AdminPhaseSectionProps>) {
  const [busyKey, setBusyKey] = useState<"event" | "phase" | "refresh" | null>(null);

  const handleActivateEvent = async (nextEventId: string) => {
    if (!nextEventId || nextEventId === eventId) return;

    setBusyKey("event");
    try {
      await onActivateEvent(nextEventId);
    } finally {
      setBusyKey(null);
    }
  };

  const handleUpdatePhase = async (phaseType: EventPhaseDto["type"]) => {
    if (!state || phaseType === state.activePhase?.type) return;

    setBusyKey("phase");
    try {
      await onUpdatePhase(phaseType);
    } finally {
      setBusyKey(null);
    }
  };

  const handleRefresh = async () => {
    setBusyKey("refresh");
    try {
      await onRefresh();
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.16),transparent_36%),linear-gradient(180deg,rgba(18,24,11,0.95),rgba(11,14,8,0.97))] px-4 py-4 text-[var(--bg-paper)] shadow-[var(--shadow-panel)] sm:px-5">
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="editorial-kicker text-[var(--neon-green)]">Phase</p>
            <h2 className="text-lg font-semibold text-[var(--bg-paper)]">
              Evento ativo e mudanca de fase
            </h2>
            <p className="text-sm leading-6 text-[rgba(245,237,224,0.78)]">
              As decisoes globais da edicao ficam aqui: escolher a mesa ativa e
              avancar o ritual entre fases.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(12,16,8,0.7)] px-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[var(--accent-purple-soft)]">
                  <CalendarClock className="h-4 w-4" />
                  <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em]">
                    Evento ativo
                  </p>
                </div>

                <div className="space-y-2">
                  <Select
                    value={eventId && events.some((event) => event.id === eventId) ? eventId : ""}
                    onValueChange={(value) => void handleActivateEvent(value)}
                    disabled={busyKey === "event" || events.length === 0}
                  >
                    <SelectTrigger className="w-full border-[rgba(212,184,150,0.16)] bg-[rgba(18,23,12,0.92)] text-[var(--bg-paper)] data-[placeholder]:text-[rgba(245,237,224,0.56)] [&_svg:not([class*='text-'])]:text-[rgba(245,237,224,0.62)] focus-visible:bg-[rgba(18,23,12,0.92)]">
                      <SelectValue placeholder="Escolher evento" />
                    </SelectTrigger>
                    <SelectContent className="border-[rgba(212,184,150,0.16)] bg-[rgba(18,23,12,0.98)] text-[var(--bg-paper)]">
                      {events.map((event) => (
                        <SelectItem className="text-[var(--bg-paper)] focus:bg-[rgba(177,140,255,0.2)] focus:text-[var(--bg-paper)]" key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(18,23,12,0.74)] px-3 py-3">
                    <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[rgba(245,237,224,0.66)]">
                      Edicao em curso
                    </p>
                    <p className="mt-2 text-base font-semibold text-[var(--bg-paper)]">
                      {activeEventName ?? adminCopy.controlStrip.activeEventFallback}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleRefresh()}
                  disabled={busyKey === "refresh"}
                  className="gap-2"
                >
                  <RefreshCw
                    className={busyKey === "refresh" ? "h-4 w-4 animate-spin" : "h-4 w-4"}
                  />
                  Atualizar contexto
                </Button>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(12,16,8,0.7)] px-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[var(--moss)]">
                  <TimerReset className="h-4 w-4" />
                  <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em]">
                    Fase atual
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {getPhaseLabel(state?.activePhase?.type)}
                  </Badge>
                  {state?.activePhase ? (
                    <Badge variant="outline">
                      Fecha a {formatPhaseWindow(state.activePhase)}
                    </Badge>
                  ) : null}
                </div>

                {state ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {state.phases.map((phase) => {
                      const isActive = phase.type === state.activePhase?.type;

                      return (
                        <button
                          key={phase.id}
                          type="button"
                          onClick={() => void handleUpdatePhase(phase.type)}
                          disabled={busyKey === "phase"}
                          className={cn(
                            "canhoes-tap rounded-[var(--radius-md-token)] border px-4 py-3 text-left transition-[background-color,border-color,color,box-shadow]",
                            isActive
                              ? "border-[var(--border-purple)] bg-[linear-gradient(180deg,rgba(31,40,20,0.98),rgba(18,24,11,0.98))] text-[var(--bg-paper)] shadow-[var(--glow-purple-sm)]"
                              : "border-[rgba(212,184,150,0.14)] bg-[rgba(18,23,12,0.72)] text-[var(--bg-paper)] hover:bg-[rgba(28,36,18,0.92)]"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em]">
                              {getPhaseLabel(phase.type)}
                            </span>
                            {isActive ? <Badge variant="secondary">Atual</Badge> : null}
                          </div>
                          <p
                            className={cn(
                              "mt-2 text-xs",
                              isActive ? "text-[rgba(245,237,224,0.76)]" : "text-[rgba(245,237,224,0.66)]"
                            )}
                          >
                            Fecha a {formatPhaseWindow(phase)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <AdminStateMessage variant="panel">
                    {adminCopy.state.noState}
                  </AdminStateMessage>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
