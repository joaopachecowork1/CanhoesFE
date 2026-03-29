"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAdminBootstrap } from "@/hooks/useAdminBootstrap";
import { useEventOverview } from "@/hooks/useEventOverview";
import { refreshEventOverview } from "@/lib/canhoesEvent";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

import {
  type AdminSectionId,
  buildAdminSectionItems,
  getDefaultAdminSection,
} from "./adminSections";
import { AdminControlStrip } from "./components/AdminControlStrip";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminSectionNav } from "./components/AdminSectionNav";
import { CategoriesAdmin } from "./components/CategoriesAdmin";
import { EventStateCard } from "./components/EventStateCard";
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

  const adminTabs = useMemo(
    () =>
      buildAdminSectionItems({
        nomineePendingCount: pendingNominees.length,
        pendingReviewCount,
        voteCount: votes.length,
      }),
    [pendingNominees.length, pendingReviewCount, votes.length]
  );

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive).length,
    [categories]
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as AdminSectionId)}
      className="space-y-4"
    >
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
        <AdminSectionNav items={adminTabs} />
      </div>

      {dashboardError ? (
        <div className="flex flex-wrap gap-2">
          <Badge variant="destructive">Erro: {dashboardError}</Badge>
          <Badge variant="outline">
            Atualiza a edicao ou verifica o backend antes de moderar.
          </Badge>
        </div>
      ) : null}

      <div className="space-y-4">
        <TabsContent value="dashboard" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="nominees" className="space-y-4">
          <NomineesAdmin
            eventId={activeEvent?.id ?? null}
            nominees={allNominees}
            categories={categories}
            loading={loading}
            onUpdate={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <PendingProposals
            eventId={activeEvent?.id ?? null}
            categoryProposals={allCategoryProposals}
            measureProposalsAll={allMeasureProposals}
            loading={loading}
            onUpdate={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="state" className="space-y-4">
          <EventStateCard
            activeEventName={activeEvent?.name ?? null}
            state={state}
            eventId={activeEvent?.id ?? null}
            events={events}
            onActivateEvent={handleActivateEvent}
            onUpdate={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="secret-santa" className="space-y-4">
          <SecretSantaAdmin
            activeEventName={activeEvent?.name ?? null}
            eventId={activeEvent?.id ?? null}
            loading={loading}
            onUpdate={handleRefresh}
            state={secretSanta}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoriesAdmin
            eventId={activeEvent?.id ?? null}
            categories={categories}
            categoryProposals={allCategoryProposals}
            measureProposals={allMeasureProposals}
            loading={loading}
            onUpdate={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UsersAdmin members={members} loading={loading} />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <VotesAudit votes={votes} categories={categories} loading={loading} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
