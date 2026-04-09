"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart2, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import type { AdminOfficialResultsDto } from "@/lib/api/types";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";
import { cn } from "@/lib/utils";
import { AdminStateMessage } from "@/components/modules/canhoes/admin/components/AdminStateMessage";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ADMIN_CONTENT_CARD_CLASS,
  AdminDetailPanel,
  AdminDetailSheet,
  AdminListPanel,
  AdminSelectableButton,
} from "./adminContentUi";

export function AdminOfficialResultsSection({
  eventId,
  initialResults,
}: Readonly<{
  eventId: string | null;
  initialResults?: AdminOfficialResultsDto;
}>) {
  const isAdmin = useIsAdmin();
  const [isVotersVisible, setIsVotersVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const queryEventId = eventId ?? "";

  const resultsQuery = useQuery({
    queryKey: ["admin-official-results", queryEventId],
    enabled: Boolean(eventId) && isAdmin,
    queryFn: () => canhoesEventsRepo.adminGetOfficialResults(queryEventId),
    initialData: initialResults,
  });

  const resultCategories = useMemo(
    () => resultsQuery.data?.categories ?? [],
    [resultsQuery.data]
  );

  const selectedCategory = useMemo(
    () =>
      resultCategories.find((category) => category.categoryId === selectedCategoryId) ?? null,
    [resultCategories, selectedCategoryId]
  );

  useEffect(() => {
    setIsVotersVisible(false);
  }, [selectedCategoryId]);

  if (!isAdmin) {
    return (
      <AdminStateMessage tone="warning">Secao disponivel apenas para admins.</AdminStateMessage>
    );
  }

  if (!eventId) {
    return <AdminStateMessage>Falta uma edicao ativa para consultar resultados.</AdminStateMessage>;
  }

  if (resultsQuery.isLoading) {
    return <AdminStateMessage>A carregar resultados oficiais...</AdminStateMessage>;
  }

  if (!resultsQuery.data) {
    return (
      <AdminStateMessage
        tone="warning"
        action={<Button onClick={() => void resultsQuery.refetch()}>Tentar novamente</Button>}
      >
        Sem resultados para mostrar neste momento.
      </AdminStateMessage>
    );
  }

  const results = resultsQuery.data;

  const getParticipationClass = (rate: number) => {
    if (rate < 0.5) return "text-[var(--neon-red)]";
    if (rate < 0.8) return "text-[var(--neon-amber)]";
    return "text-[var(--neon-green)]";
  };

  const getRankMeta = (index: number) => {
    if (index === 0) return { medal: "🥇", fillClass: "bg-[var(--neon-amber)]" };
    if (index === 1) return { medal: "🥈", fillClass: "bg-[var(--text-muted)]" };
    if (index === 2) return { medal: "🥉", fillClass: "bg-[var(--bark)]" };
    return { medal: "", fillClass: "bg-[var(--bark)]" };
  };

  return (
    <div className="space-y-4">
      <Card className={ADMIN_CONTENT_CARD_CLASS}>
        <CardHeader className="space-y-1">
          <p className="editorial-kicker">Analise</p>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Resultados oficiais
          </CardTitle>
          <p className="text-xs text-[var(--text-muted)]">
            Gerado em {new Date(results.generatedAt).toLocaleString("pt-PT")}
          </p>
        </CardHeader>
      </Card>

      {results.categories.length === 0 ? (
        <AdminStateMessage variant="panel">
          Ainda nao existem resultados oficiais para esta edicao.
        </AdminStateMessage>
      ) : null}

      {results.categories.length > 0 ? (
        <AdminListPanel>
          {results.categories.map((category) => {
            const isSelected = category.categoryId === selectedCategoryId;
            const participationRate = Math.round(category.participationRate * 100);

            return (
              <AdminSelectableButton
                key={category.categoryId}
                type="button"
                onClick={() => setSelectedCategoryId(category.categoryId)}
                selected={isSelected}
                aria-pressed={isSelected}
              >
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {category.categoryName}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {category.totalVotes}/{results.totalMembers} votaram ({participationRate}%)
                </p>
              </AdminSelectableButton>
            );
          })}
        </AdminListPanel>
      ) : null}

      <AdminDetailSheet
        open={Boolean(selectedCategory)}
        onOpenChange={(open) => !open && setSelectedCategoryId(null)}
        kicker="Resultados"
        title={selectedCategory?.categoryName ?? ""}
        description={
          selectedCategory
            ? `${selectedCategory.totalVotes}/${results.totalMembers} membros votaram (${Math.round(
                selectedCategory.participationRate * 100
              )}%)`
            : undefined
        }
      >
        {selectedCategory ? (
          <>
            <AdminDetailPanel className={getParticipationClass(selectedCategory.participationRate)}>
              Participacao {Math.round(selectedCategory.participationRate * 100)}%
            </AdminDetailPanel>

            <div className="space-y-3">
              {[...selectedCategory.nominees]
                .sort((left, right) => right.voteCount - left.voteCount)
                .map((nominee, index) => {
                  const { medal, fillClass } = getRankMeta(index);
                  const percentage =
                    selectedCategory.totalVotes > 0
                      ? Math.round((nominee.voteCount / selectedCategory.totalVotes) * 100)
                      : 0;

                  return (
                    <div key={nominee.nomineeId} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm text-[var(--text-primary)]">
                          {medal} {nominee.nomineeTitle}
                        </p>
                        <span className="text-xs text-[var(--text-muted)]">
                          {nominee.voteCount} votos ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className={cn("h-full", fillClass)} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-center"
              onClick={() => setIsVotersVisible((current) => !current)}
            >
              {isVotersVisible ? (
                <ChevronUp className="mr-2 h-4 w-4" />
              ) : (
                <ChevronDown className="mr-2 h-4 w-4" />
              )}
              Ver eleitores
            </Button>

            {isVotersVisible ? (
              <AdminDetailPanel className="max-h-[34svh] space-y-1 overflow-y-auto animate-in fade-in duration-200">
                {[...selectedCategory.nominees]
                  .sort((left, right) => right.voteCount - left.voteCount)
                  .map((nominee) => (
                    <p key={nominee.nomineeId} className="text-xs text-[var(--text-muted)]">
                      <span className="text-[var(--text-primary)]">{nominee.nomineeTitle}</span>:{" "}
                      {nominee.voterUserIds.join(", ") || "Sem votos"}
                    </p>
                  ))}
              </AdminDetailPanel>
            ) : null}
          </>
        ) : null}
      </AdminDetailSheet>
    </div>
  );
}
