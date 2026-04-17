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
import { AdminNominationsSection } from "./AdminNominationsSection";
import { AdminContentTabs } from "./AdminContentTabs";
import { AdminOfficialResultsSection } from "./AdminOfficialResultsSection";
import { CategoriesAdmin } from "./CategoriesAdmin";
import { PendingProposals } from "./PendingProposals";
import { VotesAudit } from "./VotesAudit";

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

  const safeAdminNominees = useMemo(
    () => (Array.isArray(adminNominees) ? adminNominees : []),
    [adminNominees]
  );
  const safeCategoryProposals = useMemo(
    () => (Array.isArray(categoryProposals) ? categoryProposals : []),
    [categoryProposals]
  );
  const safeMeasureProposals = useMemo(
    () => (Array.isArray(measureProposals) ? measureProposals : []),
    [measureProposals]
  );

  const pendingCounts = useMemo(
    () => ({
      categoryProposals: safeCategoryProposals.filter((proposal) => proposal.status === "pending").length,
      measureProposals: safeMeasureProposals.filter((proposal) => proposal.status === "pending").length,
      nominations: safeAdminNominees.filter((nominee) => nominee.status === "pending").length,
    }),
    [safeAdminNominees, safeCategoryProposals, safeMeasureProposals]
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
        <CategoriesAdmin
          adminNominees={safeAdminNominees}
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
      break;
    default:
      content = (
        <div className="space-y-6">
          <AdminNominationsSection
            categories={categories}
            eventId={eventId}
            initialRows={safeAdminNominees}
          />

          <PendingProposals
            categoryProposals={safeCategoryProposals}
            eventId={eventId}
            loading={loading}
            measureProposalsAll={safeMeasureProposals}
            onUpdate={onUpdate}
          />
        </div>
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
