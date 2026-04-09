"use client";

import { useCallback, useEffect, useMemo, useState, lazy, Suspense, type ReactElement } from "react";

import { AsyncStatusCard } from "@/components/ui/async-status-card";
import { Button } from "@/components/ui/button";
import { SectionBoundary } from "@/components/ui/section-boundary";
import { useAdminBootstrap } from "@/hooks/useAdminBootstrap";
import { useEventOverview } from "@/hooks/useEventOverview";
import { refreshEventOverview } from "@/lib/canhoesEvent";
import { adminCopy } from "@/lib/canhoesCopy";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { countVisibleModules } from "@/lib/modules";
import { ApiError } from "@/lib/api/canhoesClient";

import {
  type AdminSectionId,
  buildAdminSectionItems,
  getDefaultAdminSection,
} from "./adminSections";
import { AdminStateMessage } from "./components/AdminStateMessage";
import { AdminTabs } from "./components/AdminTabs";

// OPTIMIZATION: Lazy load admin sections to reduce initial bundle size
const AdminContentSection = lazy(() => import("./components/AdminContentSection").then(m => ({ default: m.AdminContentSection })));
const AdminMembersSection = lazy(() => import("./components/AdminMembersSection").then(m => ({ default: m.AdminMembersSection })));
const AdminOverviewSection = lazy(() => import("./components/AdminOverviewSection").then(m => ({ default: m.AdminOverviewSection })));
const AdminControlCenter = lazy(() => import("./components/AdminControlCenter").then(m => ({ default: m.AdminControlCenter })));

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

  const pendingNominationCount = adminNominees.length > 0
    ? adminNominees.filter((nominee) => nominee.status === "pending").length
    : pendingReviewCounts.nominees;
  const pendingReviewCount = pendingReviewCounts.categories + pendingReviewCounts.measures;

  const stats = useMemo(
    () => ({
      totalNominees: allNominees.length,
      pendingNominees: pendingReviewCounts.nominees,
      totalCategories: categories.length,
      pendingCategories: pendingReviewCounts.categories,
      memberCount: eventMembers.length,
      visibleModules: countVisibleModules(eventState?.effectiveModules),
    }),
    [
      allNominees,
      pendingReviewCounts.nominees,
      categories.length,
      pendingReviewCounts.categories,
      eventMembers.length,
      eventState?.effectiveModules,
    ]
  );

  const handleRefresh = useCallback(async () => {
    await refresh();
    refreshEventOverview();
    await refreshOverview();
  }, [refresh, refreshOverview]);

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
        pendingNominationsCount: pendingNominationCount,
        pendingReviewCount,
        visibleModuleCount: countVisibleModules(eventState?.effectiveModules),
      }),
    [eventMembers.length, eventState?.effectiveModules, pendingNominationCount, pendingReviewCount]
  );

  const activeSectionMeta =
    adminTabs.find((section) => section.id === activeTab) ?? null;

  const showMobileSummary = Boolean(
    !loading && activeEvent && showTabs && activeTab !== "configuracoes"
  );

  const SECTION_CONFIG: Record<AdminSectionId, () => ReactElement> = {
    dashboard: () => (
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
    conteudo: () => (
      <Suspense fallback={loadingFallback}>
        <AdminContentSection
          adminNominees={adminNominees}
          categories={categories}
          categoryProposals={allCategoryProposals}
          eventId={activeEvent?.id ?? null}
          initialResults={officialResults}
          loading={loading}
          measureProposals={measureProposals}
          onUpdate={handleRefresh}
          votes={voteAuditRows}
        />
      </Suspense>
    ),
    membros: () => (
      <Suspense fallback={loadingFallback}>
        <AdminMembersSection loading={loading} members={eventMembers} />
      </Suspense>
    ),
    configuracoes: () => (
      <Suspense fallback={loadingFallback}>
        <AdminControlCenter
          activeEventName={activeEvent?.name ?? null}
          eventId={activeEvent?.id ?? null}
          events={events}
          loading={loading}
          onRefresh={handleRefresh}
          secretSantaState={secretSanta}
          state={eventState}
        />
      </Suspense>
    ),
  };

  const loadingFallback = (
    <AsyncStatusCard
      label="A abrir secao do admin"
      hint="A preparar os dados e o layout desta area."
      timeoutHint="Se esta secao nao abrir, recarrega a pagina para recuperar o admin."
      actionLabel="Recarregar"
      onAction={() => globalThis.location.reload()}
    />
  );
  const sectionRenderer = SECTION_CONFIG[activeTab];
  const activeSectionContent = sectionRenderer ? (
    <SectionBoundary
      title={`Erro ao abrir ${activeSectionMeta?.label ?? "esta secao"}`}
      description="Esta secao do admin falhou ao renderizar, mas o resto do painel continua disponivel."
      onRetry={() => void handleRefresh()}
      resetKey={activeTab}
    >
      <Suspense fallback={loadingFallback}>{sectionRenderer()}</Suspense>
    </SectionBoundary>
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

      {showMobileSummary && (
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
