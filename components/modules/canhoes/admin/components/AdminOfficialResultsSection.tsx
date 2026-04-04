"use client";

import { useState } from "react";
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

  const resultsQuery = useQuery({
    queryKey: ["admin-official-results", eventId],
    enabled: Boolean(eventId) && isAdmin,
    queryFn: () => canhoesEventsRepo.adminGetOfficialResults(eventId!),
    initialData: initialResults,
  });

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

  const results = resultsQuery.data;

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

      {results.categories.map((category) => {
        const participationLabel = `${category.totalVotes}/${results.totalMembers} membros votaram (${Math.round(category.participationRate * 100)}%)`;
        const participationClass =
          category.participationRate < 0.5
            ? "text-[var(--neon-red)]"
            : category.participationRate < 0.8
            ? "text-[var(--neon-amber)]"
            : "text-[var(--neon-green)]";

        const ranked = [...category.nominees].sort((left, right) => right.voteCount - left.voteCount);
        const isExpanded = Boolean(expandedCategories[category.categoryId]);

        return (
          <Card key={category.categoryId} className="border-[var(--color-moss)]/20 bg-[rgba(16,20,11,0.9)]">
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>{category.categoryName}</CardTitle>
                <span className={cn("text-sm font-medium", participationClass)}>{participationLabel}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {ranked.map((nominee, index) => {
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
                const percentage = category.totalVotes > 0 ? Math.round((nominee.voteCount / category.totalVotes) * 100) : 0;
                const fillClass = index === 0 ? "bg-[var(--neon-amber)]" : index === 1 ? "bg-[var(--text-muted)]" : "bg-[var(--bark)]";

                return (
                  <div key={nominee.nomineeId} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-[var(--text-primary)] truncate">{medal} {nominee.nomineeTitle}</p>
                      <span className="text-xs text-[var(--text-muted)]">{nominee.voteCount} votos ({percentage}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
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
                    [category.categoryId]: !current[category.categoryId],
                  }))
                }
              >
                {isExpanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                Ver eleitores
              </Button>

              {isExpanded ? (
                <div className="space-y-1 rounded-md border border-[rgba(212,184,150,0.14)] bg-[rgba(12,16,10,0.75)] p-3 animate-in fade-in duration-200">
                  {/* ADMIN ONLY - nao expor ao cliente membro */}
                  {ranked.map((nominee) => (
                    <p key={nominee.nomineeId} className="text-xs text-[var(--text-muted)]">
                      <span className="text-[var(--text-primary)]">{nominee.nomineeTitle}</span>: {nominee.voterUserIds.join(", ") || "Sem votos"}
                    </p>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
