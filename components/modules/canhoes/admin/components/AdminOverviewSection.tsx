"use client";

import type { ReactNode } from "react";
import { CalendarClock, Eye, TimerReset, Vote } from "lucide-react";

import { formatEventPhaseLabel } from "@/components/modules/canhoes/CanhoesModuleParts";
import { adminCopy } from "@/lib/canhoesCopy";
import { countVisibleModules } from "@/lib/modules";
import type {
  CategoryProposalDto,
  EventAdminStateDto,
  MeasureProposalDto,
  NomineeDto,
} from "@/lib/api/types";

import { AdminDashboard } from "./AdminDashboard";
import { AdminStateMessage } from "./AdminStateMessage";

type AdminOverviewSectionProps = {
  activeEventName: string | null;
  allNominees: NomineeDto[];
  loading: boolean;
  pendingCategoryProposals: CategoryProposalDto[];
  pendingMeasureProposals: MeasureProposalDto[];
  pendingNominees: NomineeDto[];
  state: EventAdminStateDto | null;
};

export function AdminOverviewSection({
  activeEventName,
  allNominees,
  loading,
  pendingCategoryProposals,
  pendingMeasureProposals,
  pendingNominees,
  state,
}: Readonly<AdminOverviewSectionProps>) {
  const pendingReviewCount =
    pendingNominees.length +
    pendingCategoryProposals.length +
    pendingMeasureProposals.length;

  const visibleModuleCount = countVisibleModules(state?.effectiveModules);

  return (
    <div className="space-y-5">
      <section className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.16),transparent_36%),linear-gradient(180deg,rgba(18,24,11,0.95),rgba(11,14,8,0.97))] px-4 py-4 text-[var(--bg-paper)] shadow-[var(--shadow-panel)] sm:px-5">
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="editorial-kicker text-[var(--neon-green)]">Overview</p>
            <h2 className="text-lg font-semibold text-[var(--bg-paper)]">
              Painel de leitura da edicao
            </h2>
            <p className="text-sm leading-6 text-[rgba(245,237,224,0.78)]">
              Estado atual, ritmo da fila e sinais principais da edicao sem misturar
              controlos no topo.
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
        allNominees={allNominees}
        loading={loading}
        pendingCategoryProposals={pendingCategoryProposals}
        pendingMeasureProposals={pendingMeasureProposals}
        pendingNominees={pendingNominees}
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
    <div className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(12,16,8,0.68)] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span
          className={
            tone === "highlight"
              ? "flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(177,140,255,0.34)] bg-[rgba(177,140,255,0.2)] text-[var(--bg-paper)] shadow-[var(--glow-purple-sm)]"
              : "flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(122,173,58,0.26)] bg-[rgba(122,173,58,0.16)] text-[var(--bg-paper)]"
          }
        >
          {icon}
        </span>
        <p className="max-w-[11rem] text-right text-base font-semibold text-[var(--bg-paper)]">
          {value}
        </p>
      </div>
      <p className="mt-3 font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[rgba(245,237,224,0.66)]">
        {label}
      </p>
    </div>
  );
}
