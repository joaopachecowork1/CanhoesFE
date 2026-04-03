"use client";

import { useCallback, useEffect, useState } from "react";
import { Cigarette, Flame, Trophy } from "lucide-react";
import { toast } from "sonner";

import type {
  EventPhaseDto,
  EventVotingBoardDto,
  EventVotingCategoryDto,
} from "@/lib/api/types";
import { ErrorAlert } from "@/components/ui/error-alert";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { cn } from "@/lib/utils";
import { useEventOverview } from "@/hooks/useEventOverview";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatPhaseLabel(phaseType?: EventPhaseDto["type"]) {
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
      return "Desconhecida";
  }
}

export function CanhoesVotingModule() {
  const { event, overview, isLoading: isOverviewLoading } = useEventOverview();
  const [votingBoard, setVotingBoard] = useState<EventVotingBoardDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingVoteKey, setSavingVoteKey] = useState<string | null>(null);

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

  const handleVote = async (categoryId: string, optionId: string) => {
    if (!event || !isVotingOpen) return;

    setSavingVoteKey(`${categoryId}:${optionId}`);
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
      setSavingVoteKey(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="canhoes-section-title flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[var(--color-fire)]" />
            Votacao
          </h1>
          <p className="body-small text-[var(--color-text-muted)]">
            O boletim desta fase usa o mesmo overview do evento para decidir se a
            votacao esta aberta e que categorias podes fechar.
          </p>
        </div>

        {overview ? (
          <Badge variant="outline">Fase: {formatPhaseLabel(overview.activePhase?.type)}</Badge>
        ) : null}
      </div>

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
        <div className="space-y-4">
          {votingBoard.categories.map((category) => (
            <VotingCategoryCard
              key={category.id}
              category={category}
              isSavingKey={savingVoteKey}
              onVote={handleVote}
              votingOpen={isVotingOpen}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function VotingCategoryCard({
  category,
  isSavingKey,
  onVote,
  votingOpen,
}: Readonly<{
  category: EventVotingCategoryDto;
  isSavingKey: string | null;
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
            isDisabled={!votingOpen || Boolean(isSavingKey)}
            isSaving={isSavingKey === `${category.id}:${option.id}`}
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
  const actionLabel = isSaving ? "A guardar..." : isSelected ? "Selecionado" : "Votar";

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
