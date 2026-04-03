"use client";

import { useMemo, useState, type ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { adminCopy } from "@/lib/canhoesCopy";
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

  let content: ReactNode;
  if (loading) {
    content = <div className="body-small text-[rgba(245,237,224,0.68)]">{adminCopy.audit.loading}</div>;
  } else if (votes.length === 0) {
    content = <div className="body-small text-[rgba(245,237,224,0.68)]">{adminCopy.audit.empty}</div>;
  } else {
    content = (
      <>
        <Input
          placeholder={adminCopy.audit.search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="body-small text-[rgba(245,237,224,0.68)]">
          {filteredVotes.length} de {votes.length} votos
          {filteredVotes.length >= MAX_DISPLAY
            ? ` (a mostrar no maximo ${MAX_DISPLAY})`
            : ""}
        </div>

        <Separator className="bg-[rgba(212,184,150,0.12)]" />

        <div className="space-y-3">
          {filteredVotes.map((vote, index) => (
            <article
              key={`${vote.userId}:${vote.categoryId}:${index}`}
              className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-4 py-4"
            >
              <div className="space-y-2">
                <p className="font-semibold text-[var(--bg-paper)]">
                  {categoryMap.get(vote.categoryId) ?? vote.categoryId}
                </p>
                <div className="space-y-1 text-sm text-[rgba(245,237,224,0.74)]">
                  <p>Nomeado: {vote.nomineeId}</p>
                  <p>Utilizador: {vote.userId}</p>
                </div>
                <p className="text-xs text-[rgba(245,237,224,0.62)]">
                  {new Date(vote.updatedAtUtc).toLocaleString("pt-PT")}
                </p>
              </div>
            </article>
          ))}
        </div>
      </>
    );
  }

  return (
    <Card className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]">
      <CardHeader className="space-y-1">
        <p className="editorial-kicker text-[rgba(245,237,224,0.62)]">{adminCopy.audit.kicker}</p>
        <CardTitle className="text-[var(--bg-paper)]">{adminCopy.audit.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">{content}</CardContent>
    </Card>
  );
}
