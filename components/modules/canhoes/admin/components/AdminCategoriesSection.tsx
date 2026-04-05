"use client";

import type { AwardCategoryDto, CategoryProposalDto, MeasureProposalDto, NomineeDto, AdminVoteAuditRowDto } from "@/lib/api/types";

import { CategoriesAdmin } from "./CategoriesAdmin";
import { AdminNominationsSection } from "./AdminNominationsSection";
import { PendingProposals } from "./PendingProposals";
import { VotesAudit } from "./VotesAudit";

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

/**
 * Unified categories admin view.
 * Delegates to specialized sub-components for each category-related domain:
 * - CRUD de categorias
 * - Propostas pendentes de categorias e medidas
 * - Moderacao de nomeacoes
 * - Auditoria de votos
 */
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
  return (
    <div className="space-y-6">
      <CategoriesAdmin
        categories={categories}
        eventId={eventId}
        loading={loading}
        onUpdate={onUpdate}
      />

      <PendingProposals
        categoryProposals={categoryProposals}
        eventId={eventId}
        loading={loading}
        measureProposalsAll={measureProposals}
        onUpdate={onUpdate}
      />

      <AdminNominationsSection
        categories={categories}
        eventId={eventId}
      />

      <VotesAudit
        categories={categories}
        loading={loading}
        votes={votes}
      />
    </div>
  );
}
