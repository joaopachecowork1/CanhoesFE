"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAdminBootstrap } from "@/hooks/useAdminBootstrap";
import { useEventOverview } from "@/hooks/useEventOverview";
import { refreshEventOverview } from "@/lib/canhoesEvent";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

import {
  AdminControlStrip,
  type AdminSectionId,
} from "./components/AdminControlStrip";
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

  const [activeTab, setActiveTab] = useState<AdminSectionId>(
    pendingReviewCount > 0 ? "pending" : "state"
  );

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

  const adminTabs = [
    { value: "pending", label: "Fila", count: pendingReviewCount },
    { value: "state", label: "Edicao", count: 0 },
    { value: "categories", label: "Categorias", count: 0 },
    { value: "nominees", label: "Nomeacoes", count: pendingNominees.length },
    { value: "secret-santa", label: "Amigo", count: 0 },
    { value: "users", label: "Membros", count: 0 },
    { value: "audit", label: "Auditoria", count: votes.length },
    { value: "dashboard", label: "Hoje", count: 0 },
  ] as const satisfies ReadonlyArray<{
    count: number;
    label: string;
    value: AdminSectionId;
  }>;

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
