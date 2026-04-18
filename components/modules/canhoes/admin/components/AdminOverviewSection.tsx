"use client";

import type { ReactNode } from "react";
import { CalendarClock, Eye, TimerReset, Vote } from "lucide-react";

import { formatEventPhaseLabel } from "@/components/modules/canhoes/CanhoesModuleParts";
import { adminCopy } from "@/lib/canhoesCopy";
import { countVisibleModules } from "@/lib/modules";
import type { EventAdminStateDto } from "@/lib/api/types";

import { AdminDashboard } from "./AdminDashboard";
import { AdminStateMessage } from "./AdminStateMessage";

type AdminOverviewSectionProps = {
  activeEventName: string | null;
  eventId: string | null;
  loading: boolean;
  pendingCategoryProposalsCount: number;
  pendingMeasureProposalsCount: number;
  pendingNominationCount: number;
  state: EventAdminStateDto | null;
};

export function AdminOverviewSection({
  activeEventName,
  eventId,
  loading,
  pendingCategoryProposalsCount,
  pendingMeasureProposalsCount,
  pendingNominationCount,
  state,
}: Readonly<AdminOverviewSectionProps>) {
  const pendingReviewCount =
    pendingNominationCount +
    pendingCategoryProposalsCount +
    pendingMeasureProposalsCount;

  const visibleModuleCount = countVisibleModules(state?.effectiveModules);

  return (
    <div className="space-y-5">
      <section className="rounded-[var(--radius-lg-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper)] px-4 py-4 text-[var(--ink-primary)] shadow-[var(--shadow-paper)] sm:px-5">
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="editorial-kicker text-[var(--moss-glow)]">Admin</p>
            <h2 className="text-lg font-semibold text-[var(--ink-primary)]">
              Painel operacional da edicao
            </h2>
            <p className="text-sm leading-6 text-[var(--ink-muted)]">
              Leitura rapida do evento, da fila e dos sinais principais sem misturar controlos com o conteudo operacional.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewMetric
              icon={<CalendarClock className="h-4 w-4" />}
              label="Edicao ativa"
              value={activeEventName ?? adminCopy.controlStrip.activeEventFallback}
            />
            <OverviewMetric
              icon={<TimerReset className="h-4 w-4" />}
              label="Fase atual"
              value={
                state?.activePhase?.type
                  ? formatEventPhaseLabel(state.activePhase.type)
                  : "Sem fase ativa"
              }
            />
            <OverviewMetric
              icon={<Eye className="h-4 w-4" />}
              label="Modulos visiveis"
              value={`${visibleModuleCount}`}
            />
            <OverviewMetric
              icon={<Vote className="h-4 w-4" />}
              label="Fila pendente"
              value={`${pendingReviewCount}`}
              tone={pendingReviewCount > 0 ? "highlight" : "default"}
            />
          </div>
        </div>
      </section>

      {state ? null : (
        <AdminStateMessage variant="panel">{adminCopy.state.noState}</AdminStateMessage>
      )}

      <AdminDashboard
        eventId={eventId}
        loading={loading}
        pendingCategoryProposalsCount={pendingCategoryProposalsCount}
        pendingMeasureProposalsCount={pendingMeasureProposalsCount}
        pendingNominationCount={pendingNominationCount}
      />
    </div>
  );
}

function OverviewMetric({
  icon,
  label,
  tone = "default",
  value,
}: Readonly<{
  icon: ReactNode;
  label: string;
  tone?: "default" | "highlight";
  value: string;
}>) {
  return (
    <div className="rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span
          className={
            tone === "highlight"
              ? "flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-moss)] bg-[rgba(122,173,58,0.16)] text-[var(--ink-primary)]"
              : "flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[rgba(74,92,47,0.12)] text-[var(--ink-primary)]"
          }
        >
          {icon}
        </span>
        <p className="max-w-[11rem] text-right text-base font-semibold text-[var(--ink-primary)]">
          {value}
        </p>
      </div>
      <p className="mt-3 font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
        {label}
      </p>
    </div>
  );
}
