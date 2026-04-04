"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Flame, Loader2, Vote } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { CastOfficialVoteRequest, OfficialVotingBoardDto, OfficialVotingCategoryDto } from "@/lib/api/types";
import { useEventOverview } from "@/hooks/useEventOverview";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { CanhoesModuleHeader } from "@/components/modules/canhoes/CanhoesModuleParts";
import { CanhoesVotingModule } from "@/components/modules/canhoes/CanhoesVotingModule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";

export function CanhoesOfficialVotingModule() {
  const queryClient = useQueryClient();
  const { event, overview } = useEventOverview();

  const eventId = event?.id ?? null;
  const queryEventId = eventId ?? "";
  const isOfficialVotingPhase = overview?.activePhase?.type === "VOTING";

  const boardQuery = useQuery({
    queryKey: ["official-voting", queryEventId],
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.getOfficialVotingBoard(queryEventId),
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const boardCategories = boardQuery.data?.categories ?? [];

  const castVote = useMutation({
    mutationFn: (payload: CastOfficialVoteRequest) =>
      canhoesEventsRepo.castOfficialVote(queryEventId, payload),
    onMutate: async (payload) => {
      if (!eventId) return { previous: null };

      await queryClient.cancelQueries({ queryKey: ["official-voting", queryEventId] });
      const previous = queryClient.getQueryData<OfficialVotingBoardDto>(["official-voting", queryEventId]);

      queryClient.setQueryData<OfficialVotingBoardDto>(["official-voting", queryEventId], (old) => {
        if (!old) return old;
        return {
          ...old,
          categories: old.categories.map((category) =>
            category.id === payload.categoryId
              ? { ...category, myNomineeId: payload.nomineeId }
              : category
          ),
        };
      });

      return { previous };
    },
    onError: (error, _payload, context) => {
      if (eventId && context?.previous) {
        queryClient.setQueryData(["official-voting", queryEventId], context.previous);
      }
      logFrontendError("CanhoesOfficialVoting.castVote", error, { eventId });
      toast.error(getErrorMessage(error, "Nao foi possivel registar o voto. Tenta novamente."));
    },
    onSettled: async () => {
      if (!eventId) return;
      await queryClient.invalidateQueries({ queryKey: ["official-voting", queryEventId] });
    },
  });

  useEffect(() => {
    if (boardCategories.length === 0) {
      setSelectedCategoryId(null);
      return;
    }

    setSelectedCategoryId((current) => {
      if (current && boardCategories.some((category) => category.id === current)) return current;
      return boardCategories[0].id;
    });
  }, [boardCategories]);

  if (boardQuery.isLoading) {
    return (
      <div className="space-y-3">
        <CanhoesModuleHeader
          icon={Vote}
          title="Votacao Oficial"
          description="Boletim oficial com uma escolha por categoria."
        />
        <FeedSkeleton />
      </div>
    );
  }

  if (!eventId || boardQuery.error || !boardQuery.data) {
    return (
      <ErrorAlert
        title="Erro ao carregar votacao oficial"
        description={getErrorMessage(boardQuery.error, "Nao foi possivel abrir o boletim oficial.")}
        actionLabel="Tentar novamente"
        onAction={() => void boardQuery.refetch()}
      />
    );
  }

  const board = boardQuery.data;
  const totalCategories = board.categories.length;
  const votedCategories = board.categories.filter((category) => Boolean(category.myNomineeId)).length;
  const completion = totalCategories > 0 ? Math.round((votedCategories / totalCategories) * 100) : 0;

  const selectedCategory =
    board.categories.find((category) => category.id === selectedCategoryId) ??
    board.categories[0] ??
    null;

  if (!isOfficialVotingPhase) {
    return <CanhoesVotingModule />;
  }

  return (
    <div className="space-y-4">
      <CanhoesModuleHeader
        icon={Vote}
        title="Votacao Oficial · Canhoes do Ano"
        description="Feed especial de voto oficial separado das polls do feed normal."
        badgeLabel={`${votedCategories}/${totalCategories}`}
      />

      <Card className="border-[var(--border-moss)] bg-[var(--bg-surface)] rounded-2xl">
        <CardContent className="space-y-3 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">Votaste em {votedCategories} de {totalCategories} categorias</span>
            <span className="font-[var(--font-mono)] text-[var(--text-primary)]">{completion}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--moss)]/30 overflow-hidden">
            <div className="h-full rounded-full bg-[var(--neon-green)] transition-all" style={{ width: `${completion}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-none">
        <div className="flex min-w-max gap-2">
          {board.categories.map((category) => {
            const isActive = selectedCategory?.id === category.id;
            const hasVote = Boolean(category.myNomineeId);

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategoryId(category.id)}
                className={cn(
                  "canhoes-tap inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  isActive
                    ? "border-[rgba(122,173,58,0.48)] bg-[linear-gradient(180deg,rgba(36,49,23,0.98),rgba(18,24,11,0.98))] text-[var(--bg-paper)] shadow-[var(--glow-green-sm)]"
                    : "border-[rgba(212,184,150,0.14)] bg-[rgba(18,23,12,0.74)] text-[rgba(245,237,224,0.9)]"
                )}
                aria-pressed={isActive}
              >
                <span className="truncate">{category.title}</span>
                {hasVote ? (
                  <span className="rounded-full border border-[rgba(122,173,58,0.34)] bg-[rgba(122,173,58,0.2)] px-1.5 py-0.5 text-[10px] text-[var(--bg-paper)]">
                    Votado
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {selectedCategory ? (
        <OfficialVotingCategoryCard
          category={selectedCategory}
          canVote={board.canVote}
          isBusy={castVote.isPending}
          onVote={(payload) => castVote.mutate(payload)}
          pendingPayload={castVote.variables ?? null}
        />
      ) : null}

      {votedCategories === totalCategories && totalCategories > 0 ? (
        <Card className="border-[var(--border-neon)] bg-[rgba(0,255,136,0.06)] rounded-2xl">
          <CardContent className="py-6 text-center text-[var(--neon-green)] font-semibold">
            Boletim completo
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function OfficialVotingCategoryCard({
  category,
  canVote,
  isBusy,
  onVote,
  pendingPayload,
}: Readonly<{
  category: OfficialVotingCategoryDto;
  canVote: boolean;
  isBusy: boolean;
  onVote: (payload: CastOfficialVoteRequest) => void;
  pendingPayload: CastOfficialVoteRequest | null;
}>) {
  const voteMap = useMemo(() => {
    const totalVotes = category.totalVotes ?? 0;
    return category.nominees.map((nominee) => {
      const count = nominee.voteCount ?? 0;
      const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      return { id: nominee.id, count, pct };
    });
  }, [category.nominees, category.totalVotes]);

  return (
    <Card className="border-[var(--border-moss)] bg-[var(--bg-surface)] rounded-2xl relative">
      {canVote ? null : (
        <div className="absolute inset-0 z-10 rounded-2xl bg-black/35 backdrop-blur-[1px] flex items-center justify-center text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
          Votacao encerrada
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-[var(--text-primary)] flex items-center gap-2">
          <Flame className="h-4 w-4 text-[var(--neon-amber)]" />
          {category.title}
        </CardTitle>
        {category.description ? (
          <p className="text-sm text-[var(--text-muted)]">{category.description}</p>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-2">
        {category.nominees.map((nominee) => {
          const selected = category.myNomineeId === nominee.id;
          const pending = isBusy && pendingPayload?.categoryId === category.id && pendingPayload.nomineeId === nominee.id;
          const stats = voteMap.find((entry) => entry.id === nominee.id);
          let statusIcon = null;

          if (pending) {
            statusIcon = <Loader2 className="h-4 w-4 animate-spin" />;
          } else if (selected) {
            statusIcon = <CheckCircle2 className="h-4 w-4" />;
          }

          return (
            <button
              key={nominee.id}
              type="button"
              disabled={!canVote || isBusy}
              onClick={() => onVote({ categoryId: category.id, nomineeId: nominee.id })}
              className={cn(
                "canhoes-list-item w-full text-left px-3 py-2 flex items-center justify-between gap-3",
                selected && "border-[var(--border-neon)] bg-[rgba(0,255,136,0.06)]"
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">{nominee.label}</p>
                {category.totalVotes && category.totalVotes > 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">{stats?.count ?? 0} votos ({stats?.pct ?? 0}%)</p>
                ) : null}
              </div>

              <div className="shrink-0 text-[var(--neon-green)]">{statusIcon}</div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
