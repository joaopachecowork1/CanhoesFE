"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type {
  AdminNomineeDto,
  AdminOfficialResultsDto,
  AdminVoteAuditRowDto,
  AwardCategoryDto,
  CategoryProposalDto,
  MeasureProposalDto,
} from "@/lib/api/types";
import {
  buildAdminContentSectionItems,
  getDefaultAdminContentSection,
  isAdminContentSectionId,
  type AdminContentSectionId,
} from "../adminContentSections";
import { AdminCategoriesSection } from "./AdminCategoriesSection";
import { AdminContentTabs } from "./AdminContentTabs";
import { AdminQueueSection } from "./AdminQueueSection";
import { AdminResultsSection } from "./AdminResultsSection";

type AdminContentSectionProps = {
  adminNominees: AdminNomineeDto[];
  categories: AwardCategoryDto[];
  categoryProposals: CategoryProposalDto[];
  eventId: string | null;
  initialResults?: AdminOfficialResultsDto;
  loading: boolean;
  measureProposals: MeasureProposalDto[];
  onUpdate: () => Promise<void>;
  votes: AdminVoteAuditRowDto[];
};

export function AdminContentSection({
  adminNominees,
  categories,
  categoryProposals,
  eventId,
  initialResults,
  loading,
  measureProposals,
  onUpdate,
  votes,
}: Readonly<AdminContentSectionProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeViewParam = searchParams.get("view");
  const activeView: AdminContentSectionId =
    activeViewParam && isAdminContentSectionId(activeViewParam)
      ? activeViewParam
      : getDefaultAdminContentSection();

  const pendingCounts = useMemo(
    () => ({
      categoryProposals: categoryProposals.filter((proposal) => proposal.status === "pending").length,
      measureProposals: measureProposals.filter((proposal) => proposal.status === "pending").length,
      nominations: adminNominees.filter((nominee) => nominee.status === "pending").length,
    }),
    [adminNominees, categoryProposals, measureProposals]
  );

  const contentItems = useMemo(
    () =>
      buildAdminContentSectionItems({
        categoriesCount: categories.length,
        pendingCategoryProposalsCount: pendingCounts.categoryProposals,
        pendingMeasureProposalsCount: pendingCounts.measureProposals,
        pendingNominationsCount: pendingCounts.nominations,
        resultsCount: initialResults?.categories.length ?? 0,
      }),
    [categories.length, initialResults?.categories.length, pendingCounts]
  );

  const handleSelectView = useCallback(
    (nextView: AdminContentSectionId) => {
      if (nextView === activeView) return;

      const nextSearchParams = new URLSearchParams(searchParams.toString());
      if (nextView === getDefaultAdminContentSection()) {
        nextSearchParams.delete("view");
      } else {
        nextSearchParams.set("view", nextView);
      }

      const nextQuery = nextSearchParams.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    },
    [activeView, pathname, router, searchParams]
  );

  let content = null;
  switch (activeView) {
    case "categorias":
      content = (
        <AdminCategoriesSection
          adminNominees={adminNominees}
          categories={categories}
          eventId={eventId}
          loading={loading}
          onUpdate={onUpdate}
          votes={votes}
        />
      );
      break;
    case "resultados":
      content = (
        <AdminResultsSection
          categories={categories}
          eventId={eventId}
          initialResults={initialResults}
          loading={loading}
          votes={votes}
        />
      );
      break;
    default:
      content = (
        <AdminQueueSection
          adminNominees={adminNominees}
          categories={categories}
          categoryProposals={categoryProposals}
          eventId={eventId}
          loading={loading}
          measureProposals={measureProposals}
          onUpdate={onUpdate}
        />
      );
      break;
  }

  return (
    <div className="space-y-4">
      <AdminContentTabs
        activeId={activeView}
        items={contentItems}
        onSelect={handleSelectView}
      />

      {content}
    </div>
  );
}
