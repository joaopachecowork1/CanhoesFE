"use client";

import { TimerReset } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventAdminStateDto, EventPhaseDto } from "@/lib/api/types";

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

function getPhaseBadge(phase: EventPhaseDto) {
  return phase.isActive ? "Ativa" : undefined;
}

type EventConfigurationPanelProps = {
  busy: boolean;
  onUpdatePhase: (phaseType: EventPhaseDto["type"]) => void;
  state: EventAdminStateDto;
  visibleModulesCount: number;
};

export function EventConfigurationPanel({
  busy,
  onUpdatePhase,
  state,
  visibleModulesCount,
}: Readonly<EventConfigurationPanelProps>) {
  return (
    <Card className="border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2 text-[var(--neon-green)]">
          <TimerReset className="h-4 w-4" />
          <span className="label">{state.configurationKicker}</span>
        </div>
        <CardTitle>{state.configurationTitle}</CardTitle>
        <p className="body-small text-[var(--beige)]/72">
          {state.configurationDescription}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <p className="label text-[var(--beige)]/68">
              {state.phaseLabel}
            </p>
            <Select
              value={state.activePhase?.type ?? ""}
              onValueChange={(value) =>
                onUpdatePhase(value as EventPhaseDto["type"])
              }
              disabled={busy}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolher fase" />
              </SelectTrigger>
              <SelectContent>
                {state.phases.map((phase) => (
                  <SelectItem key={phase.id} value={phase.type}>
                    {getPhaseLabel(phase.type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-3 py-3">
              <p className="label text-[var(--bark)]/62">
                {state.visibleModulesLabel}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-ink)]">
                {visibleModulesCount}
              </p>
              <p className="mt-1 text-xs text-[var(--bark)]/72">
                {state.visibleModulesDescription}
              </p>
            </div>
            <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-3 py-3">
              <p className="label text-[var(--bark)]/62">
                {state.pendingLabel}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-ink)]">
                {state.counts.pendingProposalCount}
              </p>
              <p className="mt-1 text-xs text-[var(--bark)]/72">
                {state.pendingDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {state.phases.map((phase) => (
            <div
              key={phase.id}
              className={
                phase.isActive
                  ? "canhoes-paper-card rounded-[var(--radius-md-token)] border-[var(--border-purple)] px-3 py-3 shadow-[var(--glow-purple-sm)]"
                  : "canhoes-paper-card rounded-[var(--radius-md-token)] px-3 py-3"
              }
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--text-ink)]">
                  {getPhaseLabel(phase.type)}
                </p>
                {getPhaseBadge(phase) && (
                  <Badge variant="secondary">{getPhaseBadge(phase)}</Badge>
                )}
              </div>
              <p className="mt-2 text-xs text-[var(--bark)]/72">
                {state.phaseClosesPrefix} {formatPhaseWindow(phase)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
