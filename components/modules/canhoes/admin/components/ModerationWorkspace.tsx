"use client";

import { useState } from "react";

import type {
  AwardCategoryDto,
  CategoryProposalDto,
  MeasureProposalDto,
  NomineeDto,
} from "@/lib/api/types";

import { AdminSectionSummary } from "./AdminSectionSummary";
import { NomineesAdmin } from "./NomineesAdmin";
import { PendingProposals } from "./PendingProposals";

type ModerationWorkspaceProps = {
  eventId: string | null;
  nominees: NomineeDto[];
  categories: AwardCategoryDto[];
  categoryProposals: CategoryProposalDto[];
  measureProposals: MeasureProposalDto[];
  loading: boolean;
  onUpdate: () => Promise<void>;
};

type ModerationView = "nominees" | "proposals";

export function ModerationWorkspace({
  eventId,
  nominees,
  categories,
  categoryProposals,
  measureProposals,
  loading,
  onUpdate,
}: Readonly<ModerationWorkspaceProps>) {
  const [view, setView] = useState<ModerationView>("nominees");

  const pendingNomineeCount = nominees.filter((nominee) => nominee.status === "pending").length;
  const pendingCategoryProposalCount = categoryProposals.filter(
    (proposal) => proposal.status === "pending"
  ).length;
  const pendingMeasureProposalCount = measureProposals.filter(
    (proposal) => proposal.status === "pending"
  ).length;

  const totalPendingProposals = pendingCategoryProposalCount + pendingMeasureProposalCount;

  return (
    <div className="space-y-4">
      <AdminSectionSummary
        kicker="Moderacao"
        title="Fila de moderacao"
        description="Revê nomeacoes, categorias e medidas numa unica area com filtros dedicados por tipo."
        items={[
          {
            label: "Nomeacoes pendentes",
            value: pendingNomineeCount,
            tone: pendingNomineeCount > 0 ? "highlight" : "default",
          },
          {
            label: "Categorias pendentes",
            value: pendingCategoryProposalCount,
            tone: pendingCategoryProposalCount > 0 ? "highlight" : "default",
          },
          {
            label: "Medidas pendentes",
            value: pendingMeasureProposalCount,
            tone: pendingMeasureProposalCount > 0 ? "highlight" : "default",
          },
          {
            label: "Total pendentes",
            value: pendingNomineeCount + totalPendingProposals,
            tone: "muted",
          },
        ]}
      />

      <div className="inline-flex rounded-full border border-[var(--border-subtle)] bg-[var(--bg-deep)] p-1 text-xs shadow-[var(--shadow-panel)]">
        <button
          type="button"
          className={`px-3 py-1.5 rounded-full transition-colors ${
            view === "nominees"
              ? "bg-[var(--accent-green-soft)] text-[var(--bg-deep)]"
              : "text-[var(--beige)]/80 hover:bg-[var(--bg-paper-olive)]/40"
          }`}
          onClick={() => setView("nominees")}
        >
          Nomeacoes
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 rounded-full transition-colors ${
            view === "proposals"
              ? "bg-[var(--accent-green-soft)] text-[var(--bg-deep)]"
              : "text-[var(--beige)]/80 hover:bg-[var(--bg-paper-olive)]/40"
          }`}
          onClick={() => setView("proposals")}
        >
          Categorias e medidas
        </button>
      </div>

      {view === "nominees" ? (
        <NomineesAdmin
          eventId={eventId}
          nominees={nominees}
          categories={categories}
          loading={loading}
          onUpdate={onUpdate}
        />
      ) : (
        <PendingProposals
          eventId={eventId}
          categoryProposals={categoryProposals}
          measureProposalsAll={measureProposals}
          loading={loading}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

