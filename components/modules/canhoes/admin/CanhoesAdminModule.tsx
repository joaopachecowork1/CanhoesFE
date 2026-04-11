"use client";

import { useCallback, useEffect, lazy, Suspense, type ReactElement } from "react";

import { AsyncStatusCard } from "@/components/ui/async-status-card";
import { Button } from "@/components/ui/button";
import { SectionBoundary } from "@/components/ui/section-boundary";
import { useAdminBootstrap } from "@/hooks/useAdminBootstrap";
import { useEventOverview } from "@/hooks/useEventOverview";
import { refreshEventOverview } from "@/lib/canhoesEvent";
import { adminCopy } from "@/lib/canhoesCopy";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { ApiError } from "@/lib/api/canhoesClient";

import {
  type AdminSectionId,
  getAdminSectionItem,
} from "./adminSections";
import { AdminStateMessage } from "./components/AdminStateMessage";

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
  section: AdminSectionId;
};

export default function CanhoesAdminModule({
  section,
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
    pendingCategoryProposals,
    pendingMeasureProposals,
    pendingNominationCount,
    pendingNominees,
    secretSanta,
    state: eventState,
    summary,
    votes: voteAuditRows,
    refresh,
  } = useAdminBootstrap(activeEvent?.id ?? null);

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

  const activeSectionMeta = getAdminSectionItem(section);

  const showMobileSummary = Boolean(
    !loading && activeEvent && section !== "configuracoes"
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
        <AdminMembersSection
          activeEventName={activeEvent?.name ?? null}
          eventId={activeEvent?.id ?? null}
          loading={loading}
          members={eventMembers}
          onUpdate={handleRefresh}
          secretSantaState={secretSanta}
        />
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
  const sectionRenderer = SECTION_CONFIG[section];
  const activeSectionContent = sectionRenderer ? (
    <SectionBoundary
      title={`Erro ao abrir ${activeSectionMeta?.label ?? "esta secao"}`}
      description="Esta secao do admin falhou ao renderizar, mas o resto do painel continua disponivel."
      onRetry={() => void handleRefresh()}
      resetKey={section}
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
                {summary.totalNominees} total
              </p>
              <p className="text-[var(--text-subtle)] text-[0.58rem] leading-none">
                {pendingNominationCount} pendentes
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--layer-card)] p-2">
              <p className="text-[var(--text-subtle)] text-[0.62rem] leading-none">
                Categorias
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                {summary.totalCategories} total
              </p>
              <p className="text-[var(--text-subtle)] text-[0.58rem] leading-none">
                {summary.pendingCategoryProposalCount} pendentes
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--layer-card)] p-2">
              <p className="text-[var(--text-subtle)] text-[0.62rem] leading-none">
                Membros
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                {summary.memberCount}
              </p>
              <p className="text-[var(--text-subtle)] text-[0.58rem] leading-none">
                {summary.visibleModuleCount} módulos
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSectionContent}
    </div>
  );
}
