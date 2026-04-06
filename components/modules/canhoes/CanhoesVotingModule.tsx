"use client";

import { useCallback, useEffect, useState } from "react";
import { Cigarette, Flame, Trophy } from "lucide-react";
import { toast } from "sonner";

import type { EventVotingBoardDto, EventVotingCategoryDto } from "@/lib/api/types";
import { ErrorAlert } from "@/components/ui/error-alert";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { cn } from "@/lib/utils";
import { useEventOverview } from "@/hooks/useEventOverview";
import { useCategorySelection } from "./useCategorySelection";
import { CategoryTabs } from "./CategoryTabs";
import {
  CanhoesModuleHeader,
  formatEventPhaseLabel,
} from "@/components/modules/canhoes/CanhoesModuleParts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CanhoesVotingModule() {
  const { event, overview, isLoading: isOverviewLoading } = useEventOverview();
  const [votingBoard, setVotingBoard] = useState<EventVotingBoardDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingVote, setSavingVote] = useState<{ categoryId: string; optionId: string } | null>(null);

  const loadVotingData = useCallback(async () => {
    if (!event) {
      setVotingBoard(null);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      setVotingBoard(await canhoesEventsRepo.getVotingBoard(event.id));
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Nao foi possivel carregar o boletim desta edicao."
      );
      logFrontendError("CanhoesVoting.loadVotingData", error, { eventId: event.id });
      setVotingBoard(null);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  useEffect(() => {
    void loadVotingData();
  }, [loadVotingData]);

  const isVotingOpen = Boolean(votingBoard?.canVote);
  const categories = votingBoard?.categories ?? [];

  const { selectedId: selectedCategoryId, setSelectedId: setSelectedCategoryId, selectedItem: selectedCategory } = useCategorySelection(categories, (c) => c.id);

  const handleVote = async (categoryId: string, optionId: string) => {
    if (!event || !isVotingOpen) return;

    setSavingVote({ categoryId, optionId });
    try {
      await canhoesEventsRepo.castVote(event.id, { categoryId, optionId });
      await loadVotingData();
    } catch (error) {
      const message = getErrorMessage(error, "Nao foi possivel registar o teu voto.");
      logFrontendError("CanhoesVoting.handleVote", error, {
        categoryId,
        eventId: event.id,
        optionId,
      });
      toast.error(message);
    } finally {
      setSavingVote(null);
    }
  };

  return (
    <div className="space-y-4">
      <CanhoesModuleHeader
        icon={Trophy}
        title="Votacao"
        description="O boletim desta fase usa o mesmo overview do evento para decidir se a votacao esta aberta e que categorias podes fechar."
        badgeLabel={
          overview ? `Fase: ${formatEventPhaseLabel(overview.activePhase?.type)}` : undefined
        }
      />

      {isLoading || isOverviewLoading ? (
        <p className="body-small text-[var(--color-text-muted)]">A carregar...</p>
      ) : null}

      {!isLoading && !isOverviewLoading && !votingBoard && errorMessage ? (
        <ErrorAlert
          title="Erro ao carregar votacao"
          description={errorMessage}
          actionLabel="Tentar novamente"
          onAction={() => void loadVotingData()}
        />
      ) : null}

      {!isLoading && !isOverviewLoading && votingBoard ? (
        <div className="space-y-3">
          <CategoryTabs
            categories={categories}
            selectedId={selectedCategoryId ?? ""}
            onSelect={setSelectedCategoryId}
            getBadge={(cat) => cat.myOptionId ? "Votado" : undefined}
          />

          {selectedCategory ? (
            <VotingCategoryCard
              category={selectedCategory}
              savingVote={savingVote}
              onVote={handleVote}
              votingOpen={isVotingOpen}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function VotingCategoryCard({
  category,
  savingVote,
  onVote,
  votingOpen,
}: Readonly<{
  category: EventVotingCategoryDto;
  savingVote: { categoryId: string; optionId: string } | null;
  onVote: (categoryId: string, optionId: string) => void;
  votingOpen: boolean;
}>) {
  const Icon = category.kind === "Sticker" ? Cigarette : Flame;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[var(--color-fire)]" />
          {category.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {category.description ? (
          <p className="body-small text-[var(--color-text-muted)]">{category.description}</p>
        ) : null}

        {category.options.map((option) => (
          <VoteOption
            key={option.id}
            isDisabled={!votingOpen || Boolean(savingVote)}
            isSaving={savingVote?.categoryId === category.id && savingVote?.optionId === option.id}
            isSelected={category.myOptionId === option.id}
            label={option.label}
            onClick={() => onVote(category.id, option.id)}
          />
        ))}

        <p className="body-small text-[var(--color-text-muted)]">
          Podes alterar o voto enquanto a fase de votacao continuar aberta.
        </p>
      </CardContent>
    </Card>
  );
}

function VoteOption({
  isDisabled,
  isSaving,
  isSelected,
  label,
  onClick,
}: Readonly<{
  isDisabled: boolean;
  isSaving: boolean;
  isSelected: boolean;
  label: string;
  onClick: () => void;
}>) {
  let actionLabel = "Votar";
  if (isSelected) {
    actionLabel = "Selecionado";
  }
  if (isSaving) {
    actionLabel = "A guardar...";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "canhoes-tap canhoes-list-item flex w-full items-center justify-between gap-3 p-3 text-left",
        isSelected && "border-[var(--color-beige)]/35 bg-[rgba(107,124,69,0.16)]",
        isDisabled && "cursor-not-allowed opacity-55"
      )}
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-[var(--color-text-primary)]">{label}</p>
        <p className="body-small text-[var(--color-text-muted)]">
          {isSelected ? "Este e o teu voto atual." : "Toca para votar nesta opcao."}
        </p>
      </div>

      <span
        className={cn(
          "rounded-full px-3 py-1 text-xs font-semibold",
          isSelected
            ? "bg-[var(--color-moss)] text-[var(--color-text-primary)]"
            : "bg-white/10 text-[var(--color-beige)]"
        )}
      >
        {actionLabel}
      </span>
    </button>
  );
}
