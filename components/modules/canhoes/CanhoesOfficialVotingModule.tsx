"use client";

import { useMemo } from "react";
import { CheckCircle2, Flame, Loader2, Vote } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { CastOfficialVoteRequest, OfficialVotingBoardDto, OfficialVotingCategoryDto } from "@/lib/api/types";
import { useEventOverview } from "@/hooks/useEventOverview";
import { useCategorySelection } from "./useCategorySelection";
import { CompactSegmentTabs } from "./CompactSegmentTabs";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { CanhoesModuleHeader } from "@/components/modules/canhoes/CanhoesModuleParts";
import { CanhoesDecorativeDivider } from "@/components/ui/canhoes-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";

export function CanhoesOfficialVotingModule() {
  const queryClient = useQueryClient();
  const { event } = useEventOverview();

  const eventId = event?.id ?? null;
  const queryEventId = eventId ?? "";

  const boardQuery = useQuery({
    queryKey: ["official-voting", queryEventId],
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.getOfficialVotingBoard(queryEventId),
  });

  const boardCategories = useMemo(
    () => boardQuery.data?.categories ?? [],
    [boardQuery.data]
  );

  const { selectedId: selectedCategoryId, setSelectedId: setSelectedCategoryId, selectedItem: selectedCategory } =
    useCategorySelection(boardCategories, (c) => c.id);

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
    onSuccess: async () => {
      if (!eventId) return;
      await queryClient.invalidateQueries({ queryKey: ["official-voting", queryEventId], exact: true });
    },
  });

  if (boardQuery.isLoading) {
    return (
      <div className="space-y-3">
        <CanhoesModuleHeader
          icon={Vote}
          title="Boletim oficial"
          description="Participacao oficial com uma escolha validada por categoria."
        />
        <FeedSkeleton />
      </div>
    );
  }

  if (!eventId || boardQuery.error || !boardQuery.data) {
    return (
      <ErrorAlert
        title="Erro ao carregar boletim oficial"
        description={getErrorMessage(boardQuery.error, "Nao foi possivel abrir o boletim oficial.")}
        actionLabel="Tentar novamente"
        tone="official"
        onAction={() => void boardQuery.refetch()}
      />
    );
  }

  const board = boardQuery.data;
  const totalCategories = board.categories.length;
  const votedCategories = board.categories.filter((category) => Boolean(category.myNomineeId)).length;
  const completion = totalCategories > 0 ? Math.round((votedCategories / totalCategories) * 100) : 0;

  return (
    <div className="space-y-4">
      <CanhoesModuleHeader
        icon={Vote}
        title="Boletim oficial"
        description="Area oficial de voto, separada das sondagens do mural."
        badgeLabel={`${votedCategories}/${totalCategories}`}
      />

      <Card className="canhoes-bits-panel canhoes-bits-panel--official rounded-2xl">
        <CardContent className="space-y-3 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">Votaste em {votedCategories} de {totalCategories} categorias oficiais</span>
            <span className="font-[var(--font-mono)] text-[var(--text-primary)]">{completion}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--moss)]/30 overflow-hidden">
            <div className="h-full rounded-full bg-[var(--neon-green)] transition-all" style={{ width: `${completion}%` }} />
          </div>
        </CardContent>
      </Card>

      <CompactSegmentTabs
        activeId={selectedCategoryId ?? ""}
        items={boardCategories.map((category) => ({
          id: category.id,
          label: category.title,
          badge: category.myNomineeId ? "Votado" : undefined,
        }))}
        onSelect={setSelectedCategoryId}
      />

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
        <Card className="canhoes-bits-panel canhoes-bits-panel--official rounded-2xl border-[var(--border-neon)] bg-[rgba(0,255,136,0.06)]">
          <CardContent className="py-6 text-center text-[var(--neon-green)] font-semibold">
            Boletim oficial completo
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
    <Card className="canhoes-bits-panel canhoes-bits-panel--official relative rounded-2xl">
      {canVote ? null : (
        <div className="absolute inset-0 z-10 rounded-2xl bg-black/35 backdrop-blur-[1px] flex items-center justify-center text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
          Boletim encerrado
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
        <CanhoesDecorativeDivider tone="moss" />

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
