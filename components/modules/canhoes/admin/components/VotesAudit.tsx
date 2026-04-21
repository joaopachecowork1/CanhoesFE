"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { VirtualizedList } from "@/components/ui/virtualized-list";
import { logFrontendError } from "@/lib/errors";
import { adminCopy } from "@/lib/canhoesCopy";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

import { AdminStateMessage } from "./AdminStateMessage";

type VoteAuditRow = {
  categoryId: string;
  categoryName: string;
  nomineeId: string;
  userId: string;
  userName: string;
  updatedAtUtc: string;
};

type Props = {
  eventId: string | null;
  loading: boolean;
};

function VotesAuditShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <article className="canhoes-paper-panel relative overflow-hidden rounded-[var(--radius-md-token)] border border-[rgba(122,173,58,0.12)] bg-[rgba(15,22,10,0.96)] px-4 py-3.5 text-[var(--ink-primary)] shadow-[0_16px_32px_rgba(0,0,0,0.14)]">
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
    <article className="grid gap-1 border-b border-[rgba(212,184,150,0.14)] px-3 py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-3">
      <p className="truncate text-sm font-semibold text-[var(--ink-primary)]">{vote.categoryName}</p>
      <div className="space-y-0.5 text-xs text-[var(--ink-muted)] sm:text-sm"><p className="truncate">Votou: {vote.userName}</p></div>
      <p className="text-[11px] text-[var(--ink-muted)] sm:text-right">{new Date(vote.updatedAtUtc).toLocaleString("pt-PT")}</p>
    </article>
  );
}

export function VotesAudit({ eventId, loading }: Readonly<Props>) {
  const [search, setSearch] = useState("");

  const votesQuery = useQuery({
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.loadAllAdminVotes(eventId!),
    queryKey: ["canhoes", "admin", "votes", eventId],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
  });

  const votes = useMemo(() => votesQuery.data ?? [], [votesQuery.data]);

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

  if (!eventId) {
    return <AdminStateMessage>Falta uma edicao ativa para consultar votos.</AdminStateMessage>;
  }

  if (loading || votesQuery.isLoading) {
    return (
      <VotesAuditShell>
        <VotesAuditState message={adminCopy.audit.loading} />
      </VotesAuditShell>
    );
  }

  if (votesQuery.error) {
    logFrontendError("VotesAudit.query", votesQuery.error, { eventId });
    return (
      <AdminStateMessage tone="error" action={<Button onClick={() => void votesQuery.refetch()}>Tentar novamente</Button>}>
        Nao foi possivel carregar a auditoria de votos.
      </AdminStateMessage>
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

        <div className="max-h-[58svh] rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(16,23,11,0.94)] shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
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
