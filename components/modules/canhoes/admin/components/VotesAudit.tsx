"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { AwardCategoryDto } from "@/lib/api/types";

type VoteAuditRow = {
  categoryId: string;
  nomineeId: string;
  userId: string;
  updatedAtUtc: string;
};

type Props = {
  votes: VoteAuditRow[];
  categories: AwardCategoryDto[];
  loading: boolean;
};

const MAX_DISPLAY = 200;

export function VotesAudit({ votes, categories, loading }: Readonly<Props>) {
  const [search, setSearch] = useState("");

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const filteredVotes = useMemo(() => {
    if (!search.trim()) return votes.slice(0, MAX_DISPLAY);

    const normalizedTerm = search.toLowerCase();
    return votes
      .filter(
        (vote) =>
          vote.nomineeId.toLowerCase().includes(normalizedTerm) ||
          vote.userId.toLowerCase().includes(normalizedTerm) ||
          categoryMap.get(vote.categoryId)?.toLowerCase().includes(normalizedTerm)
      )
      .slice(0, MAX_DISPLAY);
  }, [votes, search, categoryMap]);

  return (
    <Card className="canhoes-paper-panel border-[rgba(107,76,42,0.14)] text-[var(--text-ink)] shadow-[var(--shadow-paper-soft)]">
      <CardHeader className="space-y-1">
        <p className="editorial-kicker text-[var(--bark)]">Auditoria</p>
        <CardTitle className="text-[var(--text-ink)]">Registo de votos</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="body-small text-[var(--bark)]/68">
            A carregar auditoria...
          </div>
        ) : votes.length === 0 ? (
          <div className="body-small text-[var(--bark)]/68">
            Ainda nao ha votos registados nesta edicao.
          </div>
        ) : (
          <>
            <Input
              placeholder="Pesquisar por categoria, nomeado ou utilizador..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <div className="body-small text-[var(--bark)]/68">
              {filteredVotes.length} de {votes.length} votos
              {filteredVotes.length >= MAX_DISPLAY
                ? ` (a mostrar no maximo ${MAX_DISPLAY})`
                : ""}
            </div>

            <Separator className="bg-[rgba(107,76,42,0.12)]" />

            <div className="space-y-3">
              {filteredVotes.map((vote, index) => (
                <article
                  key={`${vote.userId}:${vote.categoryId}:${index}`}
                  className="canhoes-paper-card rounded-[var(--radius-md-token)] px-4 py-4"
                >
                  <div className="space-y-2">
                    <p className="font-semibold text-[var(--text-ink)]">
                      {categoryMap.get(vote.categoryId) ?? vote.categoryId}
                    </p>
                    <div className="space-y-1 text-sm text-[var(--bark)]/74">
                      <p>Nomeado: {vote.nomineeId}</p>
                      <p>Utilizador: {vote.userId}</p>
                    </div>
                    <p className="text-xs text-[var(--bark)]/62">
                      {new Date(vote.updatedAtUtc).toLocaleString("pt-PT")}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
