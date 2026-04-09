"use client";

import type {
  AdminOfficialResultsDto,
  AdminVoteAuditRowDto,
  AwardCategoryDto,
} from "@/lib/api/types";

import { AdminOfficialResultsSection } from "./AdminOfficialResultsSection";
import { VotesAudit } from "./VotesAudit";

type AdminResultsSectionProps = {
  categories: AwardCategoryDto[];
  eventId: string | null;
  initialResults?: AdminOfficialResultsDto;
  loading: boolean;
  votes: AdminVoteAuditRowDto[];
};

export function AdminResultsSection({
  categories,
  eventId,
  initialResults,
  loading,
  votes,
}: Readonly<AdminResultsSectionProps>) {
  return (
    <div className="space-y-6">
      <AdminOfficialResultsSection
        eventId={eventId}
        initialResults={initialResults}
      />

      <VotesAudit
        categories={categories}
        loading={loading}
        votes={votes}
      />
    </div>
  );
}
