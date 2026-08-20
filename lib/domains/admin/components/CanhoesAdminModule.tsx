"use client";

import { lazy, memo, Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";

import { AsyncStatusCard } from "@/components/ui/async-status-card";
import { Button } from "@/components/ui/button";
import { SectionBoundary } from "@/components/ui/section-boundary";
import { useAdminBootstrap } from "@/hooks/useAdminBootstrap";
import { useEventOverview } from "@/hooks/useEventOverview";
import { usePendingProposals } from "@/hooks/usePendingProposals";
import { adminCopy } from "@/lib/canhoesCopy";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { ApiError } from "@/lib/api/canhoesClient";
import { adminRepo } from "@/lib/repositories/adminRepo";
import { getPhaseLabel } from "@/lib/canhoesEvent";

import { type AdminSectionId, getAdminSectionItem } from "./adminSections";
import { AdminStateMessage } from "./AdminStateMessage";
import { ADMIN_OUTLINE_BUTTON_CLASS } from "./adminContentUi";
import type { EventActiveContextDto } from "@/lib/api/types";

// OPTIMIZATION: Lazy load admin sections to reduce initial bundle size
const AdminContentSection = lazy(() =>
  import("./AdminContentSection").then((m) => ({ default: m.AdminContentSection }))
);
const AdminMembersSection = lazy(() =>
  import("./AdminMembersSection").then((m) => ({ default: m.AdminMembersSection }))
);
const AdminOverviewSection = lazy(() =>
  import("./AdminOverviewSection").then((m) => ({ default: m.AdminOverviewSection }))
);
const AdminControlCenter = lazy(() =>
  import("./AdminControlCenter").then((m) => ({ default: m.AdminControlCenter }))
);

function getAdminErrorMessage(error: unknown) {
    if (!error) return null;
    if (error instanceof ApiError) {
        return getErrorMessage(error, "Não foi possível carregar o admin.");
    }
    if (error instanceof Error) return error.message || "Não foi possível carregar o admin.";
    return "Não foi possível carregar o admin.";
}

type CanhoesAdminModuleProps = {
    section: AdminSectionId;
    initialEventId?: string | null;
    initialContext?: EventActiveContextDto | null;
};

// OPTIMIZATION: Moved outside component to avoid recreation on every render
const LOADING_FALLBACK = (
    <AsyncStatusCard
        label="A abrir seccão do admin"
        hint="A preparar os dados e o layout desta área."
        timeoutHint="Se esta seccão não abrir, recarrega a página para recuperar o admin."
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
        <div className="rounded-lg border border-[var(--border-paper)] bg-[var(--bg-paper)]">
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
                <div className="grid grid-cols-3 gap-1.5 border-t border-[var(--border-paper-soft)] px-3 py-2">
                    <MetricTile label="Fase" value={phase ? getPhaseLabel(phase) : "—"} />
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

function MetricTile({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-md border border-[var(--border-paper-soft)] bg-[var(--bg-paper-soft)] px-2 py-1.5">
      <p className="text-[0.55rem] leading-none text-[var(--ink-muted)]">{label}</p>
      <p className="mt-1 text-xs font-semibold text-[var(--ink-primary)]">{value}</p>
    </div>
  );
}

type BuildSectionContentArgs = {
    activeEventName: string | null;
    categoriesCount: number;
    categoryProposals: Awaited<ReturnType<typeof usePendingProposals>>["categoryProposals"];
    events: { id: string; name: string }[];
    eventId: string | null;
    eventState: { activePhase?: { type: string } | null; counts?: { categoryCount?: number } } | null;
    handleRefresh: () => Promise<void>;
    loading: boolean;
    measureProposals: Awaited<ReturnType<typeof usePendingProposals>>["measureProposals"];
    pendingNominationCount: number;
    summary: {
        memberCount: number;
        officialResultsCategoryCount: number;
    };
};

function buildSectionContent({
    activeEventName,
    categoriesCount,
    categoryProposals,
    events,
    eventId,
    eventState,
    handleRefresh,
    loading,
    measureProposals,
    pendingNominationCount,
    summary,
}: Readonly<BuildSectionContentArgs>): Record<AdminSectionId, () => ReactNode> {
    return {
        dashboard: () => (
            <AdminOverviewSection
                activeEventName={activeEventName}
                eventId={eventId}
                loading={loading}
                pendingCategoryProposalsCount={categoryProposals.length}
                pendingMeasureProposalsCount={measureProposals.length}
                pendingNominationCount={pendingNominationCount}
                state={eventState as Parameters<typeof AdminOverviewSection>[0]["state"]}
            />
        ),
        conteudo: () => (
            <AdminContentSection
                categoryProposals={categoryProposals}
                categoriesCount={categoriesCount}
                eventId={eventId}
                memberCount={summary.memberCount}
                officialResultsCount={summary.officialResultsCategoryCount}
                pendingNominationCount={pendingNominationCount}
                loading={loading}
                measureProposals={measureProposals}
                onUpdate={handleRefresh}
            />
        ),
        membros: () => (
            <AdminMembersSection
                eventId={eventId}
                onUpdate={handleRefresh}
                loading={loading}
            />
        ),
        configuracoes: () => (
            <AdminControlCenter
                activeEventName={activeEventName}
                eventId={eventId}
                events={events}
                loading={loading}
                onRefresh={handleRefresh}
                state={eventState as Parameters<typeof AdminControlCenter>[0]["state"]}
            />
        ),
    };
}

const AdminMobileSummary = memo(function AdminMobileSummary({
    eventState,
    loading,
    pendingNominationCount,
    section,
    summary,
    activeEvent,
}: Readonly<{
    activeEvent: { id: string; name: string } | null;
    eventState: { activePhase?: { type: string } | null } | null;
    loading: boolean;
    pendingNominationCount: number;
    section: AdminSectionId;
    summary: {
        memberCount: number;
        pendingCategoryProposalCount: number;
        pendingMeasureProposalCount: number;
        totalCategories: number;
        totalNominees: number;
        visibleModuleCount: number;
    };
}>) {
    const showMobileSummary = !loading && activeEvent && section !== "configuracoes";

    if (!showMobileSummary) {
        return null;
    }

    const pendingTotal =
        pendingNominationCount +
        summary.pendingCategoryProposalCount +
        summary.pendingMeasureProposalCount;

    return (
        <div className="sm:hidden space-y-2">
            <div className="text-[var(--color-text-primary)] overflow-hidden rounded-[var(--radius-lg-token)] border border-[var(--border-paper)] bg-[var(--bg-paper)] px-3 py-3 shadow-[var(--shadow-paper)]">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="editorial-kicker text-[var(--sand)] text-[0.6rem]">Pendentes</p>
                        <p className="mt-0.5 text-2xl font-extrabold text-[var(--ink-primary)] tabular-nums">{pendingTotal}</p>
                        <p className="mt-1 text-[0.68rem] leading-4 text-[var(--ink-secondary)]">
                            {pendingNominationCount} nomeações, {summary.pendingCategoryProposalCount} categorias, {summary.pendingMeasureProposalCount} medidas.
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
});

export default function CanhoesAdminModule({
    section,
    initialEventId,
    initialContext,
}: Readonly<CanhoesAdminModuleProps>) {
    const { event: activeEvent, refresh: refreshOverview } = useEventOverview(initialContext);
    const queryClient = useQueryClient();
    const resolvedEventId = activeEvent?.id ?? initialEventId ?? null;
    const {
        error,
        events,
        loading: bootstrapLoading,
        state: eventState,
        summary,
    } = useAdminBootstrap(resolvedEventId);

    const {
        categoryProposals,
        measureProposals,
        loading: proposalsLoading,
    } = usePendingProposals(resolvedEventId);

    const { data: pendingNominationCount = 0, isLoading: pendingNominationCountLoading } =
        useQuery({
            enabled: !!resolvedEventId,
            queryFn: () => adminRepo.getNominationsPaged(resolvedEventId!, 0, 1000, "pending"),
            queryKey: ["canhoes", "admin", "nominations", "summary", "pending", resolvedEventId],
            refetchOnWindowFocus: false,
            select: (data) => data.total,
            staleTime: 1000 * 60 * 2,
        });

    const loading = bootstrapLoading || proposalsLoading || pendingNominationCountLoading;
    const totalCategories = eventState?.counts.categoryCount ?? summary?.officialResultsCategoriesCount ?? 0;

    const handleRefresh = useCallback(async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["adminBootstrap", resolvedEventId] }),
            queryClient.invalidateQueries({ queryKey: ["admin", "proposals", "categories", "pending", resolvedEventId] }),
            queryClient.invalidateQueries({ queryKey: ["admin", "proposals", "measures", "pending", resolvedEventId] }),
            queryClient.invalidateQueries({ queryKey: ["canhoes", "admin", "nominations", "summary", "pending", resolvedEventId] }),
            queryClient.invalidateQueries({ queryKey: ["canhoes", "admin", "categories", resolvedEventId] }),
            queryClient.invalidateQueries({ queryKey: ["canhoes", "admin", "votes", "audit", resolvedEventId] }),
            queryClient.invalidateQueries({ queryKey: ["canhoes", "admin", "members", resolvedEventId, 0, 50] }),
            queryClient.invalidateQueries({ queryKey: ["canhoes", "admin", "secret-santa-state", resolvedEventId] }),
            refreshOverview(),
        ]);
    }, [resolvedEventId, queryClient, refreshOverview]);

    const dashboardError = getAdminErrorMessage(error);
    const sectionContent = buildSectionContent({
      activeEventName: activeEvent?.name ?? null,
      categoriesCount: totalCategories,
      categoryProposals,
      events,
      eventId: activeEvent?.id ?? null,
      eventState,
      handleRefresh,
      loading,
      measureProposals,
      pendingNominationCount,
      summary: {
          memberCount: summary?.membersTotal ?? 0,
          officialResultsCategoryCount: summary?.officialResultsCategoriesCount ?? 0,
      }
    });

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
                pendingNominationCount={pendingNominationCount}
                section={section}
                summary={{
                    memberCount: summary?.membersTotal ?? 0,
                    pendingCategoryProposalCount: summary?.categoryProposalsPendingTotal ?? 0,
                    pendingMeasureProposalCount: summary?.measureProposalsPendingTotal ?? 0,
                    totalCategories: totalCategories,
                    totalNominees: summary?.nomineesTotal ?? 0,
                    visibleModuleCount: Object.values(eventState?.moduleVisibility ?? {}).filter(v => v).length,
                }}
            />

            <SectionBoundary
                title={`Erro ao abrir ${activeSectionMeta?.label ?? "esta seccão"}`}
                description="Esta seccão do admin falhou ao renderizar, mas o resto do painel continua disponível."
                onRetry={() => void handleRefresh()}
                resetKey={section}
            >
                <Suspense fallback={LOADING_FALLBACK}>
                    {sectionContent[section]()}
                </Suspense>
            </SectionBoundary>
        </div>
    );
}
