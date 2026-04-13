"use client";

import { useMemo, useState } from "react";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { VirtualizedList } from "@/components/ui/virtualized-list";
import { adminCopy } from "@/lib/canhoesCopy";
import { AdminCard } from "./AdminCard";

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
    <AdminCard>
      <CardHeader className="space-y-1">
        <p className="editorial-kicker text-[rgba(245,237,224,0.62)]">{adminCopy.audit.kicker}</p>
        <CardTitle className="text-[var(--bg-paper)]">{adminCopy.audit.title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </AdminCard>
  );
}

function VotesAuditState({ message }: Readonly<{ message: string }>) {
  return <div className="body-small text-[rgba(245,237,224,0.68)]">{message}</div>;
}

function VotesAuditRowItem({ vote }: Readonly<{ vote: VoteAuditRow }>) {
  return (
    <article className="grid gap-1 border-b border-[rgba(212,184,150,0.1)] px-3 py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-3">
      <p className="truncate text-sm font-semibold text-[var(--bg-paper)]">{vote.categoryName}</p>
      <div className="space-y-0.5 text-xs text-[rgba(245,237,224,0.74)] sm:text-sm">
        <p className="truncate">Votou: {vote.userName}</p>
      </div>
      <p className="text-[11px] text-[rgba(245,237,224,0.62)] sm:text-right">
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

        <div className="body-small text-[rgba(245,237,224,0.68)]">
          {filteredVotes.length} de {votes.length} votos
        </div>

        <Separator className="bg-[rgba(212,184,150,0.12)]" />

        <div className="max-h-[58svh] rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(11,14,8,0.72)]">
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
