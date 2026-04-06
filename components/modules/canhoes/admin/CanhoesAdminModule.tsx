"use client";

import { useCallback, useEffect, useMemo, useState, lazy, Suspense, type ReactElement } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAdminBootstrap } from "@/hooks/useAdminBootstrap";
import { useEventOverview } from "@/hooks/useEventOverview";
import { refreshEventOverview } from "@/lib/canhoesEvent";
import { adminCopy } from "@/lib/canhoesCopy";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { countVisibleModules } from "@/lib/modules";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { ApiError } from "@/lib/api/canhoesClient";
import type { EventPhaseDto } from "@/lib/api/types";

import {
  type AdminSectionId,
  buildAdminSectionItems,
  getDefaultAdminSection,
} from "./adminSections";
import { AdminStateMessage } from "./components/AdminStateMessage";
import { AdminTabs } from "./components/AdminTabs";

// OPTIMIZATION: Lazy load admin sections to reduce initial bundle size
const AdminCategoriesSection = lazy(() => import("./components/AdminCategoriesSection").then(m => ({ default: m.AdminCategoriesSection })));
const AdminMembersSection = lazy(() => import("./components/AdminMembersSection").then(m => ({ default: m.AdminMembersSection })));
const AdminModulesSection = lazy(() => import("./components/AdminModulesSection").then(m => ({ default: m.AdminModulesSection })));
const AdminNominationsSection = lazy(() => import("./components/AdminNominationsSection").then(m => ({ default: m.AdminNominationsSection })));
const AdminOfficialResultsSection = lazy(() => import("./components/AdminOfficialResultsSection").then(m => ({ default: m.AdminOfficialResultsSection })));
const AdminOverviewSection = lazy(() => import("./components/AdminOverviewSection").then(m => ({ default: m.AdminOverviewSection })));
const AdminPhaseSection = lazy(() => import("./components/AdminPhaseSection").then(m => ({ default: m.AdminPhaseSection })));

function getAdminErrorMessage(error: unknown) {
  if (!error) return null;
  if (error instanceof ApiError) {
    return getErrorMessage(error, "Nao foi possivel carregar o admin.");
  }
  if (error instanceof Error) return error.message || "Nao foi possivel carregar o admin.";
  return "Nao foi possivel carregar o admin.";
}

type CanhoesAdminModuleProps = {
  forcedSection?: AdminSectionId;
  showTabs?: boolean;
};

export default function CanhoesAdminModule({
  forcedSection,
  showTabs = true,
}: Readonly<CanhoesAdminModuleProps>) {
  const { event: activeEvent, refresh: refreshOverview } = useEventOverview();
  const {
    allCategoryProposals,
    allMeasureProposals: measureProposals,
    allNominees,
    adminNominees,
    categories,
    error,
    events,
    loading,
    members: eventMembers,
    officialResults,
    secretSanta,
    state: eventState,
    votes: voteAuditRows,
    refresh,
  } = useAdminBootstrap(activeEvent?.id ?? null);

  const [activeTab, setActiveTab] = useState<AdminSectionId>(
    forcedSection ?? getDefaultAdminSection()
  );

  useEffect(() => {
    if (!forcedSection) return;
    setActiveTab(forcedSection);
  }, [forcedSection]);

  const pendingReviewCounts = useMemo(
    () => ({
      nominees: allNominees.filter((n) => n.status === "pending").length,
      categories: allCategoryProposals.filter((p) => p.status === "pending").length,
      measures: measureProposals.filter((p) => p.status === "pending").length,
    }),
    [allNominees, allCategoryProposals, measureProposals]
  );

  const pendingReviewCount =
    pendingReviewCounts.nominees +
    pendingReviewCounts.categories +
    pendingReviewCounts.measures;

  const stats = useMemo(
    () => ({
      totalNominees: allNominees.length,
      pendingNominees: pendingReviewCounts.nominees,
      approvedNominees: allNominees.filter((n) => n.status === "approved").length,
      totalCategories: categories.length,
      pendingCategories: pendingReviewCounts.categories,
      totalMeasures: measureProposals.length,
      pendingMeasures: pendingReviewCounts.measures,
      memberCount: eventMembers.length,
      visibleModules: countVisibleModules(eventState?.effectiveModules),
    }),
    [
      allNominees,
      pendingReviewCounts.nominees,
      categories.length,
      pendingReviewCounts.categories,
      measureProposals.length,
      pendingReviewCounts.measures,
      eventMembers.length,
      eventState?.effectiveModules,
    ]
  );

  const handleRefresh = useCallback(async () => {
    await refresh();
    refreshEventOverview();
    await refreshOverview();
  }, [refresh, refreshOverview]);

  const handleActivateEvent = useCallback(
    async (eventId: string) => {
      if (!eventId || eventId === activeEvent?.id) return;

      try {
        await canhoesEventsRepo.adminActivateEvent(eventId);
        await refreshOverview();
        refreshEventOverview();
        toast.success("Evento ativo atualizado");
      } catch (nextError) {
        logFrontendError("Admin.handleActivateEvent", nextError, { eventId });
        toast.error(
          getErrorMessage(nextError, "Nao foi possivel mudar o evento ativo.")
        );
      }
    },
    [activeEvent?.id, refreshOverview]
  );

  const handleUpdatePhase = useCallback(
    async (phaseType: EventPhaseDto["type"]) => {
      if (!activeEvent?.id) return;

      try {
        await canhoesEventsRepo.updateAdminPhase(activeEvent.id, { phaseType });
        await handleRefresh();
        toast.success("Fase da edicao atualizada");
      } catch (nextError) {
        logFrontendError("Admin.handleUpdatePhase", nextError, { phaseType });
        toast.error(getErrorMessage(nextError, "Nao foi possivel mudar a fase."));
      }
    },
    [activeEvent?.id, handleRefresh]
  );

  const dashboardError = getAdminErrorMessage(error);

  useEffect(() => {
    if (!error) return;

    if (error instanceof ApiError) {
      logFrontendError("Admin.bootstrap", error, {
        endpoint: "admin-bootstrap",
        status: error.status,
        details: error.details,
      });
      return;
    }
    logFrontendError("Admin.bootstrap", error);
  }, [error]);

  const pendingNominees = allNominees.filter((n) => n.status === "pending");
  const pendingCategoryProposals = allCategoryProposals.filter((p) => p.status === "pending");
  const pendingMeasureProposals = measureProposals.filter((p) => p.status === "pending");

  const adminTabs = useMemo(
    () =>
      buildAdminSectionItems({
        memberCount: eventMembers.length,
        pendingNominationsCount: adminNominees.filter((nominee) => nominee.status === "pending").length,
        pendingReviewCount,
        visibleModuleCount: countVisibleModules(eventState?.effectiveModules),
      }),
    [adminNominees, eventMembers.length, eventState?.effectiveModules, pendingReviewCount]
  );

  const SECTION_CONFIG: Record<AdminSectionId, () => ReactElement> = {
    overview: () => (
      <AdminOverviewSection
        activeEventName={activeEvent?.name ?? null}
        allNominees={allNominees}
        loading={loading}
        pendingCategoryProposals={pendingCategoryProposals}
        pendingMeasureProposals={pendingMeasureProposals}
        pendingNominees={pendingNominees}
        state={eventState}
      />
    ),
    categories: () => (
      <AdminCategoriesSection
        categories={categories}
        categoryProposals={allCategoryProposals}
        eventId={activeEvent?.id ?? null}
        loading={loading}
        measureProposals={measureProposals}
        onUpdate={handleRefresh}
        votes={voteAuditRows}
      />
    ),
    members: () => (
      <AdminMembersSection loading={loading} members={eventMembers} />
    ),
    nominations: () => (
      <AdminNominationsSection
        eventId={activeEvent?.id ?? null}
        categories={categories}
        initialRows={adminNominees}
      />
    ),
    results: () => (
      <AdminOfficialResultsSection
        eventId={activeEvent?.id ?? null}
        initialResults={officialResults}
      />
    ),
    modules: () => (
      <AdminModulesSection
        activeEventName={activeEvent?.name ?? null}
        eventId={activeEvent?.id ?? null}
        loading={loading}
        onUpdate={handleRefresh}
        secretSantaState={secretSanta}
        state={eventState}
      />
    ),
    phase: () => (
      <AdminPhaseSection
        activeEventName={activeEvent?.name ?? null}
        eventId={activeEvent?.id ?? null}
        events={events}
        onActivateEvent={handleActivateEvent}
        onRefresh={handleRefresh}
        onUpdatePhase={handleUpdatePhase}
        state={eventState}
      />
    ),
  };

  const loadingFallback = <div className="py-8 text-center text-[var(--text-subtle)]">A carregar...</div>;
  const sectionRenderer = SECTION_CONFIG[activeTab];
  const activeSectionContent = sectionRenderer ? (
    <Suspense fallback={loadingFallback}>{sectionRenderer()}</Suspense>
  ) : null;

  return (
    <div className="space-y-5">
      {dashboardError ? (
        <AdminStateMessage
          variant="panel"
          tone="error"
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void handleRefresh()}
              className="border-[rgba(255,236,231,0.18)] bg-[rgba(30,18,12,0.92)] text-[rgba(255,236,231,0.92)] hover:bg-[rgba(44,24,16,0.96)]"
            >
              Tentar novamente
            </Button>
          }
        >
          <div className="space-y-1">
            <p className="font-semibold text-[rgba(255,236,231,0.96)]">
              Erro ao carregar o admin
            </p>
            <p>{dashboardError}</p>
            <p className="text-[rgba(255,236,231,0.76)]">{adminCopy.shell.backendHint}</p>
          </div>
        </AdminStateMessage>
      ) : null}

      {!loading && activeEvent && (
        <div className="sm:hidden">
          <div className="grid grid-cols-3 gap-1.5">
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--layer-card)] p-2">
              <p className="text-[var(--text-subtle)] text-[0.62rem] leading-none">
                Candidatos
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                {stats.totalNominees} total
              </p>
              <p className="text-[var(--text-subtle)] text-[0.58rem] leading-none">
                {stats.pendingNominees} pendentes
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--layer-card)] p-2">
              <p className="text-[var(--text-subtle)] text-[0.62rem] leading-none">
                Categorias
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                {stats.totalCategories} total
              </p>
              <p className="text-[var(--text-subtle)] text-[0.58rem] leading-none">
                {stats.pendingCategories} pendentes
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--layer-card)] p-2">
              <p className="text-[var(--text-subtle)] text-[0.62rem] leading-none">
                Membros
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                {stats.memberCount}
              </p>
              <p className="text-[var(--text-subtle)] text-[0.58rem] leading-none">
                {stats.visibleModules} módulos
              </p>
            </div>
          </div>
        </div>
      )}

      {showTabs ? (
        <div className="sticky top-[5.2rem] z-20 pb-1 sm:top-[5.45rem]">
          <AdminTabs activeId={activeTab} items={adminTabs} onSelect={setActiveTab} />
        </div>
      ) : null}

      {activeSectionContent}
    </div>
  );
}
