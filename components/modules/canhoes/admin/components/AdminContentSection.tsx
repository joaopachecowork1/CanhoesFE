"use client";

import { lazy, Suspense, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type {
  CategoryProposalDto,
  MeasureProposalDto,
} from "@/lib/api/types";
import {
  buildAdminContentSectionItems,
  getDefaultAdminContentSection,
  isAdminContentSectionId,
  type AdminContentSectionId,
} from "../adminContentSections";
import { AdminContentTabs } from "./AdminContentTabs";

// OPTIMIZATION: Lazy-load heavy admin sections — only admins use them and only
// one tab is visible at a time. This keeps the shared JS bundle smaller.
const AdminNominationsSection = lazy(() =>
  import("./AdminNominationsSection").then((m) => ({ default: m.AdminNominationsSection }))
);
const AdminOfficialResultsSection = lazy(() =>
  import("./AdminOfficialResultsSection").then((m) => ({ default: m.AdminOfficialResultsSection }))
);
const CategoriesAdmin = lazy(() =>
  import("./CategoriesAdmin").then((m) => ({ default: m.CategoriesAdmin }))
);
const PendingProposals = lazy(() =>
  import("./PendingProposals").then((m) => ({ default: m.PendingProposals }))
);
const VotesAudit = lazy(() =>
  import("./VotesAudit").then((m) => ({ default: m.VotesAudit }))
);

type AdminContentSectionProps = {
  categoryProposals: CategoryProposalDto[];
  categoriesCount: number;
  eventId: string | null;
  loading: boolean;
  measureProposals: MeasureProposalDto[];
  memberCount: number;
  officialResultsCount: number;
  pendingNominationCount: number;
  onUpdate: () => Promise<void>;
};

export function AdminContentSection({
  categoryProposals,
  categoriesCount,
  eventId,
  loading,
  measureProposals,
  memberCount,
  officialResultsCount,
  pendingNominationCount,
  onUpdate,
}: Readonly<AdminContentSectionProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeViewParam = searchParams.get("view");
  const activeView: AdminContentSectionId =
    activeViewParam && isAdminContentSectionId(activeViewParam)
      ? activeViewParam
      : getDefaultAdminContentSection();

  const safeCategoryProposals = Array.isArray(categoryProposals) ? categoryProposals : [];
  const safeMeasureProposals = Array.isArray(measureProposals) ? measureProposals : [];

  const pendingCounts = {
    categoryProposals: safeCategoryProposals.filter((proposal) => proposal.status === "pending").length,
    measureProposals: safeMeasureProposals.filter((proposal) => proposal.status === "pending").length,
    nominations: pendingNominationCount,
  };

  const contentItems = buildAdminContentSectionItems({
    categoriesCount,
    pendingCategoryProposalsCount: pendingCounts.categoryProposals,
    pendingMeasureProposalsCount: pendingCounts.measureProposals,
    pendingNominationsCount: pendingCounts.nominations,
    resultsCount: officialResultsCount,
  });

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

  const content =
    activeView === "categorias" ? (
      <Suspense fallback={null}>
        <CategoriesAdmin eventId={eventId} onUpdate={onUpdate} />
      </Suspense>
    ) : activeView === "resultados" ? (
      <Suspense fallback={null}>
        <div className="space-y-6">
          <AdminOfficialResultsSection eventId={eventId} memberCount={memberCount} />
          <VotesAudit eventId={eventId} loading={loading} />
        </div>
      </Suspense>
    ) : (
      <Suspense fallback={null}>
        <div className="space-y-6">
          <AdminNominationsSection eventId={eventId} loading={loading} />
          <PendingProposals
            categoryProposals={safeCategoryProposals}
            eventId={eventId}
            loading={loading}
            measureProposalsAll={safeMeasureProposals}
            onUpdate={onUpdate}
          />
        </div>
      </Suspense>
    );

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
