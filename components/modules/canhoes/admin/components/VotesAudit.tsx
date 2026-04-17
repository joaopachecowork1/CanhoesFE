"use client";

import { useMemo, useState } from "react";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { VirtualizedList } from "@/components/ui/virtualized-list";
import { adminCopy } from "@/lib/canhoesCopy";

type VoteAuditRow = {
  categoryId: string;
  categoryName: string;
  nomineeId: string;
  userId: string;
  userName: string;
  updatedAtUtc: string;
};

type Props = {
  votes: VoteAuditRow[];
  /** @deprecated Category names now resolved in vote payload from backend */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories?: any[];
  loading: boolean;
};

function VotesAuditShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <article className="canhoes-paper-panel relative overflow-hidden rounded-[var(--radius-md-token)] px-4 py-3.5 text-[var(--ink-primary)]">
      <CardHeader className="space-y-1">
        <p className="editorial-kicker">{adminCopy.audit.kicker}</p>
        <CardTitle>{adminCopy.audit.title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </article>
  );
}

function VotesAuditState({ message }: Readonly<{ message: string }>) {
  return <div className="body-small text-[var(--ink-muted)]">{message}</div>;
}

function VotesAuditRowItem({ vote }: Readonly<{ vote: VoteAuditRow }>) {
  return (
    <article className="grid gap-1 border-b border-[rgba(84,64,40,0.12)] px-3 py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-3">
      <p className="truncate text-sm font-semibold text-[var(--ink-primary)]">{vote.categoryName}</p>
      <div className="space-y-0.5 text-xs text-[var(--ink-muted)] sm:text-sm">
        <p className="truncate">Votou: {vote.userName}</p>
      </div>
      <p className="text-[11px] text-[var(--ink-muted)] sm:text-right">
        {new Date(vote.updatedAtUtc).toLocaleString("pt-PT")}
      </p>
    </article>
  );
}

export function VotesAudit({ votes, loading }: Readonly<Props>) {
  const [search, setSearch] = useState("");

  const filteredVotes = useMemo(() => {
    if (!search.trim()) return votes;

    const normalizedTerm = search.toLowerCase();
    return votes.filter(
      (vote) =>
        vote.categoryName.toLowerCase().includes(normalizedTerm) ||
        vote.userName.toLowerCase().includes(normalizedTerm) ||
        vote.nomineeId.toLowerCase().includes(normalizedTerm)
    );
  }, [votes, search]);

  if (loading) {
    return (
      <VotesAuditShell>
        <VotesAuditState message={adminCopy.audit.loading} />
      </VotesAuditShell>
    );
  }

  if (votes.length === 0) {
    return (
      <VotesAuditShell>
        <VotesAuditState message={adminCopy.audit.empty} />
      </VotesAuditShell>
    );
  }

  return (
    <VotesAuditShell>
      <div className="space-y-4">
        <Input
          placeholder={adminCopy.audit.search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="body-small text-[var(--ink-muted)]">
          {filteredVotes.length} de {votes.length} votos
        </div>

        <Separator className="bg-[rgba(84,64,40,0.12)]" />

        <div className="max-h-[58svh] rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)]">
          <VirtualizedList
            className="px-0 py-0"
            estimateSize={() => 52}
            items={filteredVotes}
            renderItem={(vote) => <VotesAuditRowItem vote={vote} />}
          />
        </div>
      </div>
    </VotesAuditShell>
  );
}
