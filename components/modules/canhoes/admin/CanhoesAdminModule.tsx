"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAdminBootstrap } from "@/hooks/useAdminBootstrap";
import { useEventOverview } from "@/hooks/useEventOverview";
import { refreshEventOverview } from "@/lib/canhoesEvent";
import { adminCopy } from "@/lib/canhoesCopy";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { countVisibleModules } from "@/lib/modules";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { ApiError } from "@/lib/api/canhoesClient";
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
import { AdminStateMessage } from "./components/AdminStateMessage";
import { AdminTabs } from "./components/AdminTabs";

function getAdminErrorMessage(error: unknown) {
  if (!error) return null;
  if (error instanceof ApiError) {
    return getErrorMessage(error, "Nao foi possivel carregar o admin.");
  }
  if (error instanceof Error) return error.message || "Nao foi possivel carregar o admin.";
  return "Nao foi possivel carregar o admin.";
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
        logFrontendError("Admin.handleActivateEvent", nextError, { eventId });
        toast.error(
          getErrorMessage(nextError, "Nao foi possivel mudar o evento ativo.")
        );
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
        logFrontendError("Admin.handleUpdatePhase", nextError, { phaseType });
        toast.error(getErrorMessage(nextError, "Nao foi possivel mudar a fase."));
      }
    },
    [activeEvent?.id, handleRefresh]
  );

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
            loading={loading}
            pendingCategoryProposals={pendingCategoryProposals}
            pendingMeasureProposals={pendingMeasureProposals}
            pendingNominees={pendingNominees}
            state={eventState}
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

      <div className="sticky top-[5.75rem] z-20">
        <AdminTabs activeId={activeTab} items={adminTabs} onSelect={setActiveTab} />
      </div>

      {activeSectionContent}
    </div>
  );
}
