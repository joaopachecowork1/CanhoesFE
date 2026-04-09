"use client";

import type {
  AdminNomineeDto,
  AdminVoteAuditRowDto,
  AwardCategoryDto,
} from "@/lib/api/types";

import { CategoriesAdmin } from "./CategoriesAdmin";

type AdminCategoriesSectionProps = {
  adminNominees: AdminNomineeDto[];
  categories: AwardCategoryDto[];
  eventId: string | null;
  loading: boolean;
  onUpdate: () => Promise<void>;
  votes: AdminVoteAuditRowDto[];
};

export function AdminCategoriesSection({
  adminNominees,
  categories,
  eventId,
  loading,
  onUpdate,
  votes,
}: Readonly<AdminCategoriesSectionProps>) {
  return (
    <CategoriesAdmin
      adminNominees={adminNominees}
      categories={categories}
      eventId={eventId}
      loading={loading}
      onUpdate={onUpdate}
      votes={votes}
    />
  );
}
