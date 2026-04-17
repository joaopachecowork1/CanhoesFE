"use client";

import { useCallback, useEffect, lazy, Suspense, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { AsyncStatusCard } from "@/components/ui/async-status-card";
import { Button } from "@/components/ui/button";
import { SectionBoundary } from "@/components/ui/section-boundary";
import { useAdminBootstrap } from "@/hooks/useAdminBootstrap";
import { useEventOverview } from "@/hooks/useEventOverview";
import { usePendingProposals } from "@/hooks/usePendingProposals";
import { refreshEventOverview } from "@/lib/canhoesEvent";
import { adminCopy } from "@/lib/canhoesCopy";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { ApiError } from "@/lib/api/canhoesClient";

import {
    type AdminSectionId,
    getAdminSectionItem,
} from "./adminSections";
import { AdminStateMessage } from "./components/AdminStateMessage";
import { ADMIN_OUTLINE_BUTTON_CLASS } from "./components/adminContentUi";

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
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-paper)]">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="canhoes-tap flex w-full min-h-[44px] items-center justify-between px-3 py-2 text-xs text-[var(--ink-muted)]"
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
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] px-2 py-1.5">
            <p className="text-[0.55rem] leading-none text-[var(--ink-muted)]">{label}</p>
            <p className="mt-1 text-xs font-semibold text-[var(--ink-primary)]">{value}</p>
        </div>
    );
}

function AdminMobileSummary({
    eventState,
    loading,
    section,
    summary,
    activeEvent,
}: Readonly<{
    activeEvent: { id: string; name: string } | null;
    eventState: { activePhase?: { type: string } | null } | null;
    loading: boolean;
    section: AdminSectionId;
    summary: {
        memberCount: number;
        pendingCategoryProposalCount: number;
        pendingMeasureProposalCount: number;
        pendingNominationCount: number;
        totalCategories: number;
        totalNominees: number;
        visibleModuleCount: number;
    };
}>) {
    const showMobileSummary = Boolean(!loading && activeEvent && section !== "configuracoes");

    if (!showMobileSummary) {
        return null;
    }

    return (
        <div className="sm:hidden">
            <div className="mb-2 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--bg-paper),var(--bg-paper-soft))] px-3 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="editorial-kicker text-[var(--neon-amber)] text-[0.6rem]">
                            Pendentes
                        </p>
                        <p className="mt-0.5 text-2xl font-extrabold text-[var(--ink-primary)] tabular-nums">
                            {summary.pendingNominationCount +
                                summary.pendingCategoryProposalCount +
                                summary.pendingMeasureProposalCount}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[0.6rem] text-[var(--ink-muted)]">
                            {summary.pendingNominationCount} nomeações
                        </p>
                        <p className="text-[0.6rem] text-[var(--ink-muted)]">
                            {summary.pendingCategoryProposalCount} categorias
                        </p>
                        <p className="text-[0.6rem] text-[var(--ink-muted)]">
                            {summary.pendingMeasureProposalCount} medidas
                        </p>
                    </div>
                </div>
            </div>

            <CollapsibleMobileMetrics
                phase={eventState?.activePhase?.type ?? null}
                memberCount={summary.memberCount}
                moduleCount={summary.visibleModuleCount}
                totalCategories={summary.totalCategories}
                totalNominees={summary.totalNominees}
            />
        </div>
    );
}

export default function CanhoesAdminModule({
    section,
}: Readonly<CanhoesAdminModuleProps>) {
    const { event: activeEvent, refresh: refreshOverview } = useEventOverview();
    const {
        allNominees,
        adminNominees,
        categories,
        error,
        events,
        loading: bootstrapLoading,
        members: eventMembers,
        officialResults,
        pendingCategoryProposals,
        pendingMeasureProposals,
        pendingNominees,
        secretSanta,
        state: eventState,
        summary,
        votes: voteAuditRows,
        refresh: refreshBootstrap,
    } = useAdminBootstrap(activeEvent?.id ?? null);

    const {
        categoryProposals,
        measureProposals,
        loading: proposalsLoading,
        refresh: refreshProposals,
    } = usePendingProposals(activeEvent?.id ?? null);

    const loading = bootstrapLoading || proposalsLoading;

    const handleRefresh = useCallback(async () => {
        await refreshBootstrap();
        await refreshProposals();
        refreshEventOverview();
        await refreshOverview();
    }, [refreshBootstrap, refreshProposals, refreshOverview]);

    const dashboardError = getAdminErrorMessage(error);
    const sectionContent: Record<AdminSectionId, ReactNode> = {
        dashboard: (
            <Suspense fallback={LOADING_FALLBACK}>
                <AdminOverviewSection
                    activeEventName={activeEvent?.name ?? null}
                    allNominees={allNominees}
                    loading={loading}
                    pendingCategoryProposals={pendingCategoryProposals}
                    pendingMeasureProposals={pendingMeasureProposals}
                    pendingNominees={pendingNominees}
                    state={eventState}
                />
            </Suspense>
        ),
        conteudo: (
            <Suspense fallback={LOADING_FALLBACK}>
                <AdminContentSection
                    adminNominees={adminNominees}
                    categories={categories}
                    categoryProposals={categoryProposals}
                    eventId={activeEvent?.id ?? null}
                    initialResults={officialResults}
                    loading={loading}
                    measureProposals={measureProposals}
                    onUpdate={handleRefresh}
                    votes={voteAuditRows}
                />
            </Suspense>
        ),
        membros: (
            <Suspense fallback={LOADING_FALLBACK}>
                <AdminMembersSection
                    activeEventName={activeEvent?.name ?? null}
                    eventId={activeEvent?.id ?? null}
                    members={eventMembers}
                    onUpdate={handleRefresh}
                    secretSantaState={secretSanta}
                    loading={loading}
                />
            </Suspense>
        ),
        configuracoes: (
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
        ),
    };

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
                            className={ADMIN_OUTLINE_BUTTON_CLASS}
                        >
                            Tentar novamente
                        </Button>
                    }
                >
                    <div className="space-y-1">
                        <p className="font-semibold text-[var(--ink-primary)]">
                            Erro ao carregar o admin
                        </p>
                        <p>{dashboardError}</p>
                        <p className="text-[var(--ink-muted)]">{adminCopy.shell.backendHint}</p>
                    </div>
                </AdminStateMessage>
            ) : null}

            <AdminMobileSummary
                activeEvent={activeEvent}
                eventState={eventState}
                loading={loading}
                section={section}
                summary={summary}
            />

            <SectionBoundary
                title={`Erro ao abrir ${activeSectionMeta?.label ?? "esta secao"}`}
                description="Esta secao do admin falhou ao renderizar, mas o resto do painel continua disponivel."
                onRetry={() => void handleRefresh()}
                resetKey={section}
            >
                {sectionContent[section]}
            </SectionBoundary>
        </div>
    );
}
