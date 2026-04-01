"use client";

import type { ReactNode } from "react";
import { CalendarClock, Eye, Gift, TimerReset, Users, Vote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { adminCopy } from "@/lib/canhoesCopy";
import { countVisibleModules } from "@/lib/modules";
import type {
  AwardCategoryDto,
  CategoryProposalDto,
  EventAdminSecretSantaStateDto,
  EventAdminStateDto,
  MeasureProposalDto,
  NomineeDto,
  PublicUserDto,
} from "@/lib/api/types";

import { AdminDashboard } from "./AdminDashboard";
import { AdminStateMessage } from "./AdminStateMessage";

type AdminOverviewSectionProps = {
  activeEventName: string | null;
  allNominees: NomineeDto[];
  categories: AwardCategoryDto[];
  loading: boolean;
  members: PublicUserDto[];
  pendingCategoryProposals: CategoryProposalDto[];
  pendingMeasureProposals: MeasureProposalDto[];
  pendingNominees: NomineeDto[];
  secretSantaState: EventAdminSecretSantaStateDto | null;
  state: EventAdminStateDto | null;
  totalVotes: number;
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
      return "Sem fase ativa";
  }
}

export function AdminOverviewSection({
  activeEventName,
  allNominees,
  categories,
  loading,
  members,
  pendingCategoryProposals,
  pendingMeasureProposals,
  pendingNominees,
  secretSantaState,
  state,
  totalVotes,
}: Readonly<AdminOverviewSectionProps>) {
  const pendingReviewCount =
    pendingNominees.length +
    pendingCategoryProposals.length +
    pendingMeasureProposals.length;

  const visibleModuleCount = countVisibleModules(state?.effectiveModules);

  return (
    <div className="space-y-4">
      <section className="canhoes-paper-panel rounded-[var(--radius-lg-token)] px-4 py-4 sm:px-5">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="editorial-kicker text-[var(--bark)]">Overview</p>
            <h2 className="text-lg font-semibold text-[var(--text-ink)]">
              Painel de leitura da edicao
            </h2>
            <p className="text-sm leading-6 text-[var(--bark)]/76">
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
              value={getPhaseLabel(state?.activePhase?.type)}
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

      <div className="grid gap-4 xl:grid-cols-2">
        <OverviewCard
          title="Resumo rapido"
          items={[
            {
              label: "Membros",
              value: `${members.length}`,
              icon: <Users className="h-4 w-4" />,
            },
            {
              label: "Votos registados",
              value: `${totalVotes}`,
              icon: <Vote className="h-4 w-4" />,
            },
            {
              label: "Categorias ativas",
              value: `${categories.filter((category) => category.isActive).length}`,
              icon: <Eye className="h-4 w-4" />,
            },
          ]}
        />

        <OverviewCard
          title="Abertura ao grupo"
          items={[
            {
              label: "Nomeacoes",
              value: state?.nominationsVisible ? "Abertas" : "Fechadas",
              icon: <Eye className="h-4 w-4" />,
              tone: state?.nominationsVisible ? "highlight" : "default",
            },
            {
              label: "Resultados",
              value: state?.resultsVisible ? "Abertos" : "Fechados",
              icon: <Eye className="h-4 w-4" />,
              tone: state?.resultsVisible ? "highlight" : "default",
            },
            {
              label: "Amigo Secreto",
              value: secretSantaState?.hasDraw ? "Sorteio pronto" : "Sem sorteio",
              icon: <Gift className="h-4 w-4" />,
            },
          ]}
        />
      </div>

      {!state ? (
        <AdminStateMessage variant="panel">{adminCopy.state.noState}</AdminStateMessage>
      ) : null}

      <AdminDashboard
        allNominees={allNominees}
        categories={categories}
        loading={loading}
        members={members}
        pendingCategoryProposals={pendingCategoryProposals}
        pendingMeasureProposals={pendingMeasureProposals}
        pendingNominees={pendingNominees}
        totalVotes={totalVotes}
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
    <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span
          className={
            tone === "highlight"
              ? "flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(177,140,255,0.26)] bg-[rgba(177,140,255,0.12)] text-[var(--accent-purple-deep)] shadow-[var(--glow-purple-sm)]"
              : "flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(74,92,47,0.2)] bg-[rgba(74,92,47,0.08)] text-[var(--moss)]"
          }
        >
          {icon}
        </span>
        <p className="max-w-[11rem] text-right text-base font-semibold text-[var(--text-ink)]">
          {value}
        </p>
      </div>
      <p className="mt-3 font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--bark)]/64">
        {label}
      </p>
    </div>
  );
}

function OverviewCard({
  title,
  items,
}: Readonly<{
  title: string;
  items: ReadonlyArray<{
    icon: ReactNode;
    label: string;
    tone?: "default" | "highlight";
    value: string;
  }>;
}>) {
  return (
    <section className="canhoes-paper-card rounded-[var(--radius-lg-token)] px-4 py-4 sm:px-5">
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[var(--text-ink)]">{title}</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-md-token)] border border-[rgba(107,76,42,0.12)] bg-[rgba(251,244,232,0.72)] px-3 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-[var(--bark)]">{item.icon}</span>
                <p className="text-sm text-[var(--text-ink)]">{item.label}</p>
              </div>
              <Badge
                variant={item.tone === "highlight" ? "secondary" : "outline"}
                className={
                  item.tone === "highlight"
                    ? "border-[var(--border-purple)] bg-[rgba(177,140,255,0.12)] text-[var(--accent-purple-deep)] shadow-none"
                    : ""
                }
              >
                {item.value}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
