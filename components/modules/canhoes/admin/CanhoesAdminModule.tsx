"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { useAdminBootstrap } from "@/hooks/useAdminBootstrap";
import { useEventOverview } from "@/hooks/useEventOverview";
import { refreshEventOverview } from "@/lib/canhoesEvent";
import { adminCopy } from "@/lib/canhoesCopy";
import { countVisibleModules } from "@/lib/modules";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import type { EventPhaseDto } from "@/lib/api/types";

import {
  type AdminSectionId,
  buildAdminSectionItems,
  getDefaultAdminSection,
} from "./adminSections";
import { AdminCategoriesSection } from "./components/AdminCategoriesSection";
import { AdminMembersSection } from "./components/AdminMembersSection";
import { AdminModulesSection } from "./components/AdminModulesSection";
import { AdminOverviewSection } from "./components/AdminOverviewSection";
import { AdminPhaseSection } from "./components/AdminPhaseSection";
import { AdminTabs } from "./components/AdminTabs";

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

  const [activeTab, setActiveTab] = useState<AdminSectionId>(getDefaultAdminSection());

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
    () => measureProposals.filter((proposal) => proposal.status === "pending"),
    [measureProposals]
  );

  const pendingReviewCount =
    pendingNominees.length +
    pendingCategoryProposals.length +
    pendingMeasureProposals.length;

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
        console.error("Admin activate event error:", nextError);
        toast.error("Nao foi possivel mudar o evento ativo");
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
        console.error("Admin update phase error:", nextError);
        toast.error("Nao foi possivel mudar a fase");
      }
    },
    [activeEvent?.id, handleRefresh]
  );

  const dashboardError = error instanceof Error ? error.message : null;

  const adminTabs = useMemo(
    () =>
      buildAdminSectionItems({
        memberCount: eventMembers.length,
        pendingReviewCount,
        visibleModuleCount: countVisibleModules(eventState?.effectiveModules),
      }),
    [eventMembers.length, eventState?.effectiveModules, pendingReviewCount]
  );

  const activeSectionContent = useMemo(() => {
    switch (activeTab) {
      case "overview":
        return (
          <AdminOverviewSection
            activeEventName={activeEvent?.name ?? null}
            allNominees={allNominees}
            categories={categories}
            loading={loading}
            members={eventMembers}
            pendingCategoryProposals={pendingCategoryProposals}
            pendingMeasureProposals={pendingMeasureProposals}
            pendingNominees={pendingNominees}
            secretSantaState={secretSanta}
            state={eventState}
            totalVotes={voteAuditRows.length}
          />
        );
      case "categories":
        return (
          <AdminCategoriesSection
            categories={categories}
            categoryProposals={allCategoryProposals}
            eventId={activeEvent?.id ?? null}
            loading={loading}
            measureProposals={measureProposals}
            nominees={allNominees}
            onUpdate={handleRefresh}
            votes={voteAuditRows}
          />
        );
      case "members":
        return <AdminMembersSection loading={loading} members={eventMembers} />;
      case "modules":
        return (
          <AdminModulesSection
            activeEventName={activeEvent?.name ?? null}
            eventId={activeEvent?.id ?? null}
            loading={loading}
            onUpdate={handleRefresh}
            secretSantaState={secretSanta}
            state={eventState}
          />
        );
      case "phase":
        return (
          <AdminPhaseSection
            activeEventName={activeEvent?.name ?? null}
            eventId={activeEvent?.id ?? null}
            events={events}
            onActivateEvent={handleActivateEvent}
            onRefresh={handleRefresh}
            onUpdatePhase={handleUpdatePhase}
            state={eventState}
          />
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
    eventMembers,
    events,
    handleActivateEvent,
    handleRefresh,
    handleUpdatePhase,
    loading,
    measureProposals,
    pendingCategoryProposals,
    pendingMeasureProposals,
    pendingNominees,
    secretSanta,
    eventState,
    voteAuditRows,
  ]);

  return (
    <div className="space-y-4">
      {dashboardError ? (
        <div className="flex flex-wrap gap-2">
          <Badge variant="destructive">Erro: {dashboardError}</Badge>
          <Badge variant="outline">{adminCopy.shell.backendHint}</Badge>
        </div>
      ) : null}

      <div className="sticky top-[5.75rem] z-20">
        <AdminTabs activeId={activeTab} items={adminTabs} onSelect={setActiveTab} />
      </div>

      {activeSectionContent}
    </div>
  );
}
