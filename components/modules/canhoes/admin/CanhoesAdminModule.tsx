"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { useAdminBootstrap } from "@/hooks/useAdminBootstrap";
import { useEventOverview } from "@/hooks/useEventOverview";
import { refreshEventOverview } from "@/lib/canhoesEvent";
import { adminCopy } from "@/lib/canhoesCopy";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

import {
  type AdminSectionId,
  buildAdminSectionItems,
  getAdminSection,
  getDefaultAdminSection,
} from "./adminSections";
import { AdminControlStrip } from "./components/AdminControlStrip";
import { AdminSectionNav } from "./components/AdminSectionNav";
import { AdminSectionStage } from "./components/AdminSectionStage";
import { AdminControlCenter } from "./components/AdminControlCenter";
import { CategoriesAdmin } from "./components/CategoriesAdmin";
import { ModerationWorkspace } from "./components/ModerationWorkspace";
import { UsersAdmin } from "./components/UsersAdmin";
import { VotesAudit } from "./components/VotesAudit";

function getActivePhaseLabel(phaseType?: string | null) {
  switch (phaseType) {
    case "DRAW":
      return "Sorteio";
    case "PROPOSALS":
      return "Propostas";
    case "VOTING":
      return "Votacao";
    case "RESULTS":
      return "Resultados";
    default:
      return "Sem fase ativa";
  }
}

export default function CanhoesAdminModule() {
  const { event: activeEvent, refresh: refreshOverview } = useEventOverview();
  const {
    allCategoryProposals,
    allMeasureProposals: measureProposals,
    allNominees,
    categories,
    error,
    events,
    loading,
    members: eventMembers,
    secretSanta,
    state: eventState,
    votes: voteAuditRows,
    refresh,
  } = useAdminBootstrap(activeEvent?.id ?? null);

  const pendingNominees = useMemo(
    () => allNominees.filter((nominee) => nominee.status === "pending"),
    [allNominees]
  );
  const pendingCategoryProposals = useMemo(
    () =>
      allCategoryProposals.filter((proposal) => proposal.status === "pending"),
    [allCategoryProposals]
  );
  const pendingMeasureProposals = useMemo(
    () =>
      measureProposals.filter((proposal) => proposal.status === "pending"),
    [measureProposals]
  );

  const pendingReviewCount =
    pendingNominees.length +
    pendingCategoryProposals.length +
    pendingMeasureProposals.length;

  const initialSectionResolved = useRef(false);
  const [activeTab, setActiveTab] = useState<AdminSectionId>(
    getDefaultAdminSection({ pendingReviewCount })
  );

  useEffect(() => {
    if (loading || initialSectionResolved.current) return;

    // The admin should land on the most urgent queue once the first real
    // counts arrive, but should stop auto-switching after that initial load.
    setActiveTab(getDefaultAdminSection({ pendingReviewCount }));
    initialSectionResolved.current = true;
  }, [loading, pendingReviewCount]);

  const handleRefresh = useCallback(async () => {
    await refresh();
    refreshEventOverview();
    await refreshOverview();
  }, [refresh, refreshOverview]);

  const handleActivateEvent = useCallback(
    async (eventId: string) => {
      if (!eventId || eventId === activeEvent?.id) {
        return;
      }

      try {
        await canhoesEventsRepo.adminActivateEvent(eventId);
        await refreshOverview();
        refreshEventOverview();
        toast.success("Evento ativo atualizado");
      } catch (nextError) {
        console.error("Admin activate event error:", nextError);
        toast.error("Nao foi possivel mudar o evento ativo");
      }
    },
    [activeEvent?.id, refreshOverview]
  );

  const dashboardError = error instanceof Error ? error.message : null;

  const adminCountsContext = useMemo(
    () => ({
      nomineePendingCount: pendingNominees.length,
      pendingReviewCount,
      voteCount: voteAuditRows.length,
    }),
    [pendingNominees.length, pendingReviewCount, voteAuditRows.length]
  );

  const adminTabs = useMemo(
    () => buildAdminSectionItems(adminCountsContext),
    [adminCountsContext]
  );

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive).length,
    [categories]
  );

  const activeSectionContent = useMemo(() => {
    switch (activeTab) {
      case "control-center":
        return (
          <AdminControlCenter
            activeEventName={activeEvent?.name ?? null}
            eventId={activeEvent?.id ?? null}
            events={events}
            eventState={eventState}
            secretSantaState={secretSanta}
            loading={loading}
            onActivateEvent={handleActivateEvent}
            onRefresh={handleRefresh}
          />
        );
      case "moderation":
        return (
          <ModerationWorkspace
            eventId={activeEvent?.id ?? null}
            nominees={allNominees}
            categories={categories}
            categoryProposals={allCategoryProposals}
            measureProposals={measureProposals}
            loading={loading}
            onUpdate={handleRefresh}
          />
        );
      case "categories":
        return (
          <CategoriesAdmin
            eventId={activeEvent?.id ?? null}
            categories={categories}
            categoryProposals={allCategoryProposals}
            measureProposals={measureProposals}
            loading={loading}
            onUpdate={handleRefresh}
          />
        );
      case "members":
        return <UsersAdmin members={eventMembers} loading={loading} />;
      case "audit":
        return (
          <VotesAudit votes={voteAuditRows} categories={categories} loading={loading} />
        );
      default:
        return null;
    }
  }, [
    activeEvent?.id,
    activeEvent?.name,
    activeTab,
    allCategoryProposals,
    allNominees,
    categories,
    events,
    handleActivateEvent,
    handleRefresh,
    loading,
    eventMembers,
    secretSanta,
    eventState,
    voteAuditRows,
    measureProposals,
  ]);

  const activeSection = useMemo(() => getAdminSection(activeTab), [activeTab]);
  const activeSectionCount = useMemo(
    () => activeSection?.count(adminCountsContext) ?? 0,
    [activeSection, adminCountsContext]
  );

  return (
    <div className="space-y-4">
      <AdminControlStrip
        activeEventName={activeEvent?.name ?? null}
        loading={loading}
        memberCount={eventMembers.length}
        pendingReviewCount={pendingReviewCount}
        phaseLabel={getActivePhaseLabel(eventState?.activePhase?.type)}
        totalVotes={voteAuditRows.length}
        visibleCategoryCount={activeCategories}
        onRefresh={() => void handleRefresh()}
        onSelectSection={setActiveTab}
      />

      <div className="sticky top-[5.75rem] z-20">
        <AdminSectionNav
          activeId={activeTab}
          items={adminTabs}
          onSelect={setActiveTab}
        />
      </div>

      {dashboardError ? (
        <div className="flex flex-wrap gap-2">
          <Badge variant="destructive">Erro: {dashboardError}</Badge>
          <Badge variant="outline">{adminCopy.shell.backendHint}</Badge>
        </div>
      ) : null}

      <AdminSectionStage
        title={activeSection?.label ?? "Painel"}
        description={
          activeSection?.description ?? "Controlos ativos desta edicao."
        }
        count={activeSectionCount}
        tone="default"
      >
        {activeSectionContent}
      </AdminSectionStage>
    </div>
  );
}
