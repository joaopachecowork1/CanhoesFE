"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart2, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import type { AdminOfficialResultsDto } from "@/lib/api/types";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";
import { cn } from "@/lib/utils";
import { AdminStateMessage } from "@/components/modules/canhoes/admin/components/AdminStateMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AdminOfficialResultsSection({
  eventId,
  initialResults,
}: Readonly<{
  eventId: string | null;
  initialResults?: AdminOfficialResultsDto;
}>) {
  const isAdmin = useIsAdmin();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const queryEventId = eventId ?? "";

  const resultsQuery = useQuery({
    queryKey: ["admin-official-results", queryEventId],
    enabled: Boolean(eventId) && isAdmin,
    queryFn: () => canhoesEventsRepo.adminGetOfficialResults(queryEventId),
    initialData: initialResults,
  });

  const results = resultsQuery.data ?? null;
  const resultCategories = results?.categories ?? [];

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (resultCategories.length === 0) {
      setSelectedCategoryId(null);
      return;
    }

    setSelectedCategoryId((current) => {
      if (current && resultCategories.some((category) => category.categoryId === current)) {
        return current;
      }
      return resultCategories[0].categoryId;
    });
  }, [resultCategories]);

  const selectedCategory = useMemo(
    () =>
      resultCategories.find((category) => category.categoryId === selectedCategoryId) ??
      resultCategories[0] ??
      null,
    [resultCategories, selectedCategoryId]
  );

  if (!isAdmin) {
    return <AdminStateMessage tone="warning">Secao disponivel apenas para admins.</AdminStateMessage>;
  }

  if (!eventId) {
    return <AdminStateMessage>Falta uma edicao ativa para consultar resultados.</AdminStateMessage>;
  }

  if (resultsQuery.isLoading) {
    return <AdminStateMessage>A carregar resultados oficiais...</AdminStateMessage>;
  }

  if (!resultsQuery.data) {
    return (
      <AdminStateMessage tone="warning" action={<Button onClick={() => void resultsQuery.refetch()}>Tentar novamente</Button>}>
        Sem resultados para mostrar neste momento.
      </AdminStateMessage>
    );
  }

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
      <Card className="border-[var(--color-moss)]/20 bg-[rgba(16,20,11,0.9)]">
        <CardHeader className="space-y-1">
          <p className="editorial-kicker">Analise</p>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Resultados oficiais
          </CardTitle>
          <p className="text-xs text-[var(--text-muted)]">Gerado em {new Date(results.generatedAt).toLocaleString("pt-PT")}</p>
        </CardHeader>
      </Card>

      {results.categories.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <div className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(11,14,8,0.72)] p-2">
            <div className="max-h-[58svh] space-y-1 overflow-y-auto pr-1">
              {results.categories.map((category) => {
                const isSelected = category.categoryId === selectedCategory?.categoryId;
                const participationRate = Math.round(category.participationRate * 100);

                return (
                  <button
                    key={category.categoryId}
                    type="button"
                    onClick={() => setSelectedCategoryId(category.categoryId)}
                    className={cn(
                      "w-full rounded-[var(--radius-md-token)] border px-3 py-2.5 text-left",
                      isSelected
                        ? "border-[rgba(122,173,58,0.36)] bg-[rgba(36,49,23,0.9)]"
                        : "border-[rgba(212,184,150,0.12)] bg-[rgba(18,24,11,0.62)] hover:bg-[rgba(24,31,16,0.82)]"
                    )}
                    aria-pressed={isSelected}
                  >
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {category.categoryName}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {category.totalVotes}/{results.totalMembers} votaram ({participationRate}%)
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedCategory ? (
            <Card className="border-[var(--color-moss)]/20 bg-[rgba(16,20,11,0.9)]">
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>{selectedCategory.categoryName}</CardTitle>
                  <span className={cn("text-sm font-medium", getParticipationClass(selectedCategory.participationRate))}>
                    {selectedCategory.totalVotes}/{results.totalMembers} membros votaram ({Math.round(selectedCategory.participationRate * 100)}%)
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
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

                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() =>
                    setExpandedCategories((current) => ({
                      ...current,
                      [selectedCategory.categoryId]: !current[selectedCategory.categoryId],
                    }))
                  }
                >
                  {expandedCategories[selectedCategory.categoryId] ? (
                    <ChevronUp className="mr-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="mr-2 h-4 w-4" />
                  )}
                  Ver eleitores
                </Button>

                {expandedCategories[selectedCategory.categoryId] ? (
                  <div className="max-h-[34svh] space-y-1 overflow-y-auto rounded-md border border-[rgba(212,184,150,0.14)] bg-[rgba(12,16,10,0.75)] p-3 animate-in fade-in duration-200">
                    {/* ADMIN ONLY - nao expor ao cliente membro */}
                    {[...selectedCategory.nominees]
                      .sort((left, right) => right.voteCount - left.voteCount)
                      .map((nominee) => (
                        <p key={nominee.nomineeId} className="text-xs text-[var(--text-muted)]">
                          <span className="text-[var(--text-primary)]">{nominee.nomineeTitle}</span>: {nominee.voterUserIds.join(", ") || "Sem votos"}
                        </p>
                      ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
