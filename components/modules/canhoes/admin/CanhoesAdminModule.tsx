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
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminSectionNav } from "./components/AdminSectionNav";
import { AdminSectionStage } from "./components/AdminSectionStage";
import { CategoriesAdmin } from "./components/CategoriesAdmin";
import { EventStateCard } from "./components/EventStateCard";
import { ModuleVisibilityAdmin } from "./components/ModuleVisibilityAdmin";
import { NomineesAdmin } from "./components/NomineesAdmin";
import { PendingProposals } from "./components/PendingProposals";
import { SecretSantaAdmin } from "./components/SecretSantaAdmin";
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
    allMeasureProposals,
    allNominees,
    categories,
    error,
    events,
    loading,
    members,
    secretSanta,
    state,
    votes,
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
      allMeasureProposals.filter((proposal) => proposal.status === "pending"),
    [allMeasureProposals]
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
      voteCount: votes.length,
    }),
    [pendingNominees.length, pendingReviewCount, votes.length]
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
      case "dashboard":
        return (
          <AdminDashboard
            categories={categories}
            allNominees={allNominees}
            pendingNominees={pendingNominees}
            pendingCategoryProposals={pendingCategoryProposals}
            pendingMeasureProposals={pendingMeasureProposals}
            members={members}
            totalVotes={votes.length}
            loading={loading}
          />
        );
      case "nominees":
        return (
          <NomineesAdmin
            eventId={activeEvent?.id ?? null}
            nominees={allNominees}
            categories={categories}
            loading={loading}
            onUpdate={handleRefresh}
          />
        );
      case "pending":
        return (
          <PendingProposals
            eventId={activeEvent?.id ?? null}
            categoryProposals={allCategoryProposals}
            measureProposalsAll={allMeasureProposals}
            loading={loading}
            onUpdate={handleRefresh}
          />
        );
      case "state":
        return (
          <EventStateCard
            activeEventName={activeEvent?.name ?? null}
            state={state}
            eventId={activeEvent?.id ?? null}
            events={events}
            onActivateEvent={handleActivateEvent}
            onUpdate={handleRefresh}
          />
        );
      case "visibility":
        return (
          <ModuleVisibilityAdmin
            eventId={activeEvent?.id ?? null}
            onUpdate={handleRefresh}
            state={state}
          />
        );
      case "secret-santa":
        return (
          <SecretSantaAdmin
            activeEventName={activeEvent?.name ?? null}
            eventId={activeEvent?.id ?? null}
            loading={loading}
            onUpdate={handleRefresh}
            state={secretSanta}
          />
        );
      case "categories":
        return (
          <CategoriesAdmin
            eventId={activeEvent?.id ?? null}
            categories={categories}
            categoryProposals={allCategoryProposals}
            measureProposals={allMeasureProposals}
            loading={loading}
            onUpdate={handleRefresh}
          />
        );
      case "users":
        return <UsersAdmin members={members} loading={loading} />;
      case "audit":
        return (
          <VotesAudit votes={votes} categories={categories} loading={loading} />
        );
      default:
        return null;
    }
  }, [
    activeEvent?.id,
    activeEvent?.name,
    activeTab,
    allCategoryProposals,
    allMeasureProposals,
    allNominees,
    categories,
    events,
    handleActivateEvent,
    handleRefresh,
    loading,
    members,
    pendingCategoryProposals,
    pendingMeasureProposals,
    pendingNominees,
    secretSanta,
    state,
    votes,
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
        memberCount={members.length}
        pendingReviewCount={pendingReviewCount}
        phaseLabel={getActivePhaseLabel(state?.activePhase?.type)}
        totalVotes={votes.length}
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
        tone={activeTab === "visibility" ? "purple" : "default"}
      >
        {activeSectionContent}
      </AdminSectionStage>
    </div>
  );
}
