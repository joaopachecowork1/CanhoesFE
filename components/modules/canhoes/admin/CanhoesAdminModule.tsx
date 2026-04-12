"use client";

import { useCallback, useEffect, lazy, Suspense, useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";

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

// OPTIMIZATION: Moved outside component to avoid recreation on every render
const LOADING_FALLBACK = (
  <AsyncStatusCard
    label="A abrir secao do admin"
    hint="A preparar os dados e o layout desta area."
    timeoutHint="Se esta secao nao abrir, recarrega a pagina para recuperar o admin."
    actionLabel="Recarregar"
    onAction={() => globalThis.location.reload()}
  />
);

/** Collapsible secondary metrics for mobile admin summary. */
function CollapsibleMobileMetrics({
  phase,
  memberCount,
  moduleCount,
  totalCategories,
  totalNominees,
}: Readonly<{
  phase: string | null;
  memberCount: number;
  moduleCount: number;
  totalCategories: number;
  totalNominees: number;
}>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-deep)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="canhoes-tap flex w-full min-h-[44px] items-center justify-between px-3 py-2 text-xs text-[var(--text-muted)]"
      >
        <span>Detalhes do evento</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="grid grid-cols-3 gap-1.5 border-t border-[var(--border-subtle)] px-3 py-2">
          <MetricTile label="Fase" value={phase ? formatPhaseShort(phase) : "—"} />
          <MetricTile label="Membros" value={String(memberCount)} />
          <MetricTile label="Módulos" value={String(moduleCount)} />
          <MetricTile label="Categorias" value={String(totalCategories)} />
          <MetricTile label="Nomeações" value={String(totalNominees)} />
          <MetricTile label="Edição" value={memberCount > 0 ? "Ativa" : "—"} />
        </div>
      )}
    </div>
  );
}

function formatPhaseShort(type: string): string {
  const map: Record<string, string> = {
    DRAW: "Sorteio",
    PROPOSALS: "Propostas",
    VOTING: "Votação",
    RESULTS: "Resultados",
  };
  return map[type] ?? type;
}

function MetricTile({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-md border border-[rgba(212,184,150,0.1)] bg-[rgba(12,16,8,0.5)] px-2 py-1.5">
      <p className="text-[0.55rem] leading-none text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-xs font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

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

  // OPTIMIZATION: Memoized to avoid recreation on every render
  const sectionContent = useMemo(() => {
    switch (section) {
      case "dashboard":
        return (
          <AdminOverviewSection
            activeEventName={activeEvent?.name ?? null}
            allNominees={allNominees}
            loading={loading}
            pendingCategoryProposals={pendingCategoryProposals}
            pendingMeasureProposals={pendingMeasureProposals}
            pendingNominees={pendingNominees}
            state={eventState}
          />
        );
      case "conteudo":
        return (
          <Suspense fallback={LOADING_FALLBACK}>
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
        );
      case "membros":
        return (
          <Suspense fallback={LOADING_FALLBACK}>
            <AdminMembersSection
              activeEventName={activeEvent?.name ?? null}
              eventId={activeEvent?.id ?? null}
              loading={loading}
              members={eventMembers}
              onUpdate={handleRefresh}
              secretSantaState={secretSanta}
            />
          </Suspense>
        );
      case "configuracoes":
        return (
          <Suspense fallback={LOADING_FALLBACK}>
            <AdminControlCenter
              activeEventName={activeEvent?.name ?? null}
              eventId={activeEvent?.id ?? null}
              events={events}
              loading={loading}
              onRefresh={handleRefresh}
              state={eventState}
            />
          </Suspense>
        );
      default:
        return null;
    }
  }, [
    section,
    activeEvent?.name,
    activeEvent?.id,
    loading,
    allNominees,
    pendingCategoryProposals,
    pendingMeasureProposals,
    pendingNominees,
    eventState,
    adminNominees,
    categories,
    allCategoryProposals,
    officialResults,
    measureProposals,
    handleRefresh,
    voteAuditRows,
    eventMembers,
    secretSanta,
    events,
  ]);
  const activeSectionContent = sectionContent ? (
    <SectionBoundary
      title={`Erro ao abrir ${activeSectionMeta?.label ?? "esta secao"}`}
      description="Esta secao do admin falhou ao renderizar, mas o resto do painel continua disponivel."
      onRetry={() => void handleRefresh()}
      resetKey={section}
    >
      <Suspense fallback={LOADING_FALLBACK}>{sectionContent}</Suspense>
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
          {/* Pending count — primary metric, always visible */}
          <div className="mb-2 rounded-xl border border-[rgba(224,90,58,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(224,90,58,0.1),transparent_34%),linear-gradient(180deg,rgba(30,18,12,0.96),rgba(17,11,8,0.98))] px-3 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="editorial-kicker text-[var(--neon-amber)] text-[0.6rem]">
                  Pendentes
                </p>
                <p className="mt-0.5 text-2xl font-extrabold text-[var(--bg-paper)] tabular-nums">
                  {summary.pendingNominationCount + summary.pendingCategoryProposalCount + summary.pendingMeasureProposalCount}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[0.6rem] text-[rgba(245,237,224,0.6)]">
                  {summary.pendingNominationCount} nomeações
                </p>
                <p className="text-[0.6rem] text-[rgba(245,237,224,0.6)]">
                  {summary.pendingCategoryProposalCount} categorias
                </p>
                <p className="text-[0.6rem] text-[rgba(245,237,224,0.6)]">
                  {summary.pendingMeasureProposalCount} medidas
                </p>
              </div>
            </div>
          </div>

          {/* Secondary metrics — collapsible */}
          <CollapsibleMobileMetrics
            phase={eventState?.activePhase?.type ?? null}
            memberCount={summary.memberCount}
            moduleCount={summary.visibleModuleCount}
            totalCategories={summary.totalCategories}
            totalNominees={summary.totalNominees}
          />
        </div>
      )}

      {activeSectionContent}
    </div>
  );
}
