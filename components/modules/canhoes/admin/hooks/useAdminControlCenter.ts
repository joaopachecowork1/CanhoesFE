import { useState } from "react";
import { toast } from "sonner";
import type {
  AdminModuleKey,
  EventAdminStateDto,
} from "@/lib/api/types";
import { adminRepo } from "@/lib/repositories/adminRepo";
import { useModuleVisibility, type ModuleVisibilityItem } from "@/hooks/useModuleVisibility";
import { getErrorMessage, logFrontendError } from "@/lib/errors";

export type SettingsFeedbackState = {
  message: string;
  tone: "default" | "error" | "success";
};

export const PHASE_LABELS: Record<string, string> = {
  PROPOSALS: "Nomeações",
  VOTING: "Votação",
  RESULTS: "Resultados",
  DRAW: "Sorteio",
};

export function useAdminControlCenter(
  eventId: string | null,
  state: EventAdminStateDto | null,
  events: Array<{ id: string; name: string }>,
  onRefresh: () => Promise<void>
) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [feedback, setFeedback] = useState<SettingsFeedbackState | null>(null);

  // We need to pass the eventId here, but the hook signature might have changed in my previous edit
  const {
    toggleModule,
    isUpdating,
  } = useModuleVisibility(eventId!);

  const handleUpdatePhase = async (phaseType: string) => {
    if (!eventId || phaseType === state?.activePhase?.type) return;

    setFeedback({ message: "A guardar fase...", tone: "default" });
    try {
      await adminRepo.updatePhase(eventId, { phaseType });
      await onRefresh();
      toast.success("Fase do evento atualizada");
      setFeedback({
        message: `Fase atualizada para ${PHASE_LABELS[phaseType] || phaseType}.`,
        tone: "success",
      });
    } catch (error) {
      logFrontendError("AdminControlCenter.updatePhase", error, { phaseType });
      toast.error(getErrorMessage(error, "Não foi possível mudar a fase."));
      setFeedback({ message: "Falha ao guardar a fase atual.", tone: "error" });
    }
  };

  const handleActivateEvent = async (eventIdToActivate: string) => {
    if (!eventIdToActivate || eventIdToActivate === eventId) return;

    setFeedback({ message: "A mudar evento ativo...", tone: "default" });
    try {
      await adminRepo.activateEvent(eventIdToActivate);
      await onRefresh();
      toast.success("Evento ativo atualizado");
      const nextEventName =
        events.find((event) => event.id === eventIdToActivate)?.name ?? "evento";
      setFeedback({
        message: `Evento ativo atualizado para ${nextEventName}.`,
        tone: "success",
      });
    } catch (error) {
      logFrontendError("AdminControlCenter.activateEvent", error, { eventId: eventIdToActivate });
      toast.error(getErrorMessage(error, "Não foi possível mudar o evento ativo."));
      setFeedback({ message: "Falha ao atualizar o evento ativo.", tone: "error" });
    }
  };

  const handleModuleToggle = async (item: ModuleVisibilityItem, checked: boolean) => {
    await toggleModule(item.key, !checked); // toggleModule in useModuleVisibility takes (key, currentValue)
    await onRefresh();
  };

  const handleNominationsVisibility = async (checked: boolean) => {
    if (!eventId) return;
    try {
      await adminRepo.updateAdminState(eventId, { nominationsVisible: checked });
      await onRefresh();
      toast.success(checked ? "Nomeações abertas ao grupo." : "Nomeações ocultadas do grupo.");
    } catch (error) {
      toast.error("Erro ao atualizar visibilidade das nomeações.");
    }
  };

  const handleResultsVisibility = async (checked: boolean) => {
    if (!eventId) return;
    try {
      await adminRepo.updateAdminState(eventId, { resultsVisible: checked });
      await onRefresh();
      toast.success(checked ? "Resultados abertos ao grupo." : "Resultados ocultados do grupo.");
    } catch (error) {
      toast.error("Erro ao atualizar visibilidade dos resultados.");
    }
  };

  const handleSetAllModules = async (enabled: boolean) => {
    if (!eventId) return;
    try {
      const keys = Object.keys(state?.moduleVisibility ?? {});
      const patch = Object.fromEntries(keys.map((k) => [k, enabled]));
      await adminRepo.updateModules(eventId, patch);
      await onRefresh();
      toast.success(enabled ? "Todos os módulos ativados." : "Todos os módulos desativados.");
    } catch (error) {
      toast.error("Erro ao atualizar visibilidade dos módulos.");
    }
  };

  const moduleItems: ModuleVisibilityItem[] = Object.entries(state?.moduleVisibility ?? {}).map(
    ([key, isEnabled]) => ({
      key: key as AdminModuleKey,
      label: key,
      isEnabled: isEnabled as boolean,
    })
  );

  const visibleCount = moduleItems.filter((m) => m.isEnabled).length;
  const allEnabled = moduleItems.length > 0 && visibleCount === moduleItems.length;
  const allDisabled = moduleItems.length > 0 && visibleCount === 0;

  return {
    state: {
      advancedOpen,
      feedback,
      isUpdating,
      moduleItems,
      visibleCount,
      allEnabled,
      allDisabled,
      visibilitySavingKey: isUpdating ? "ALL" : null, // placeholder
    },
    actions: {
      setAdvancedOpen,
      handleUpdatePhase,
      handleActivateEvent,
      handleModuleToggle,
      handleNominationsVisibility,
      handleResultsVisibility,
      handleSetAllModules,
    },
  };
}
