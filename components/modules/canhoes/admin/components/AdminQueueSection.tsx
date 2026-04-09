"use client";

import type {
  AdminNomineeDto,
  AwardCategoryDto,
  CategoryProposalDto,
  MeasureProposalDto,
} from "@/lib/api/types";

import { AdminNominationsSection } from "./AdminNominationsSection";
import { PendingProposals } from "./PendingProposals";

type AdminQueueSectionProps = {
  adminNominees: AdminNomineeDto[];
  categories: AwardCategoryDto[];
  categoryProposals: CategoryProposalDto[];
  eventId: string | null;
  loading: boolean;
  measureProposals: MeasureProposalDto[];
  onUpdate: () => Promise<void>;
};

export function AdminQueueSection({
  adminNominees,
  categories,
  categoryProposals,
  eventId,
  loading,
  measureProposals,
  onUpdate,
}: Readonly<AdminQueueSectionProps>) {
  return (
    <div className="space-y-6">
      <AdminNominationsSection
        categories={categories}
        eventId={eventId}
        initialRows={adminNominees}
      />

      <PendingProposals
        categoryProposals={categoryProposals}
        eventId={eventId}
        loading={loading}
        measureProposalsAll={measureProposals}
        onUpdate={onUpdate}
      />
    </div>
  );
}
