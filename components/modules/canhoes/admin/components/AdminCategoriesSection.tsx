"use client";

import { useMemo, useState } from "react";
import { FileCheck2, FolderTree, ListTodo, Vote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  AdminVoteAuditRowDto,
  AwardCategoryDto,
  CategoryProposalDto,
  MeasureProposalDto,
  NomineeDto,
} from "@/lib/api/types";

import { CategoriesAdmin } from "./CategoriesAdmin";
import { NomineesAdmin } from "./NomineesAdmin";
import { PendingProposals } from "./PendingProposals";
import { VotesAudit } from "./VotesAudit";

type CategoriesView = "categories" | "nominees" | "proposals" | "votes";

type AdminCategoriesSectionProps = {
  categories: AwardCategoryDto[];
  categoryProposals: CategoryProposalDto[];
  eventId: string | null;
  loading: boolean;
  measureProposals: MeasureProposalDto[];
  nominees: NomineeDto[];
  onUpdate: () => Promise<void>;
  votes: AdminVoteAuditRowDto[];
};

const VIEW_META = {
  categories: {
    description: "CRUD das categorias da edicao.",
    icon: FolderTree,
    label: "Categorias",
  },
  nominees: {
    description: "Revisao das nomeacoes submetidas.",
    icon: FileCheck2,
    label: "Nomeacoes",
  },
  proposals: {
    description: "Fila de propostas de categorias e medidas.",
    icon: ListTodo,
    label: "Propostas",
  },
  votes: {
    description: "Consulta dos votos registados nesta edicao.",
    icon: Vote,
    label: "Votos",
  },
} as const;

export function AdminCategoriesSection({
  categories,
  categoryProposals,
  eventId,
  loading,
  measureProposals,
  nominees,
  onUpdate,
  votes,
}: Readonly<AdminCategoriesSectionProps>) {
  const pendingNomineeCount = nominees.filter((nominee) => nominee.status === "pending").length;
  const pendingProposalCount =
    categoryProposals.filter((proposal) => proposal.status === "pending").length +
    measureProposals.filter((proposal) => proposal.status === "pending").length;

  const [activeView, setActiveView] = useState<CategoriesView>(() => {
    if (pendingNomineeCount > 0) return "nominees";
    if (pendingProposalCount > 0) return "proposals";
    return "categories";
  });

  const viewCounts = useMemo(
    () => ({
      categories: categories.length,
      nominees: pendingNomineeCount,
      proposals: pendingProposalCount,
      votes: votes.length,
    }),
    [categories.length, pendingNomineeCount, pendingProposalCount, votes.length]
  );

  return (
    <div className="space-y-4">
      <section className="canhoes-paper-panel rounded-[var(--radius-lg-token)] px-4 py-4 sm:px-5">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="editorial-kicker text-[var(--bark)]">Categories</p>
            <h2 className="text-lg font-semibold text-[var(--text-ink)]">
              Curadoria e revisao de conteudo
            </h2>
            <p className="text-sm leading-6 text-[var(--bark)]/76">
              A gestao editorial da edicao fica concentrada aqui, com uma vista de
              cada vez para reduzir ruído no telemovel.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{categories.length} categorias</Badge>
            <Badge variant="outline">{pendingNomineeCount} nomeacoes pendentes</Badge>
            <Badge variant="outline">{pendingProposalCount} propostas pendentes</Badge>
            <Badge variant="outline">{votes.length} votos registados</Badge>
          </div>

          {/* Keep content curation in one top-level tab while splitting the detail
              views below, so admins do not lose moderation tools to page sprawl. */}
          <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-none">
            <div className="flex min-w-max gap-2">
              {(Object.keys(VIEW_META) as CategoriesView[]).map((viewId) => {
                const item = VIEW_META[viewId];
                const Icon = item.icon;
                const isActive = activeView === viewId;

                return (
                  <button
                    key={viewId}
                    type="button"
                    onClick={() => setActiveView(viewId)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "canhoes-tap inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-[background-color,border-color,color,box-shadow]",
                      isActive
                        ? "border-[var(--border-purple)] bg-[linear-gradient(180deg,rgba(31,40,20,0.98),rgba(18,24,11,0.98))] text-[var(--bg-paper)] shadow-[var(--glow-purple-sm)]"
                        : "border-[rgba(107,76,42,0.16)] bg-[rgba(255,255,255,0.48)] text-[var(--text-ink)] hover:bg-[rgba(255,255,255,0.72)]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                    {viewCounts[viewId] > 0 ? (
                      <Badge
                        className={cn(
                          "rounded-full px-1.5 text-[0.7rem] shadow-none",
                          isActive
                            ? "border-[rgba(255,255,255,0.24)] bg-[rgba(255,255,255,0.16)] text-[var(--bg-paper)]"
                            : "border-[rgba(122,173,58,0.22)] bg-[rgba(122,173,58,0.12)] text-[var(--moss)]"
                        )}
                      >
                        {viewCounts[viewId]}
                      </Badge>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-sm text-[var(--bark)]/72">{VIEW_META[activeView].description}</p>
        </div>
      </section>

      {activeView === "categories" ? (
        <CategoriesAdmin
          eventId={eventId}
          categories={categories}
          loading={loading}
          onUpdate={onUpdate}
        />
      ) : null}

      {activeView === "nominees" ? (
        <NomineesAdmin
          eventId={eventId}
          nominees={nominees}
          categories={categories}
          loading={loading}
          onUpdate={onUpdate}
        />
      ) : null}

      {activeView === "proposals" ? (
        <PendingProposals
          eventId={eventId}
          categoryProposals={categoryProposals}
          measureProposalsAll={measureProposals}
          loading={loading}
          onUpdate={onUpdate}
        />
      ) : null}

      {activeView === "votes" ? (
        <VotesAudit votes={votes} categories={categories} loading={loading} />
      ) : null}
    </div>
  );
}
