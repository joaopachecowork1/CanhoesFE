"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VirtualizedList } from "@/components/ui/virtualized-list";
import { logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

import { AdminStateMessage } from "./AdminStateMessage";
import { SecretSantaAdmin } from "./SecretSantaAdmin";

type AdminMembersSectionProps = {
  activeEventName: string | null;
  eventId: string | null;
  loading: boolean;
  onUpdate: () => Promise<void>;
};

export function AdminMembersSection({
  activeEventName,
  eventId,
  loading,
  onUpdate,
}: Readonly<AdminMembersSectionProps>) {
  const membersQuery = useQuery({
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.loadAllAdminMembers(eventId!),
    queryKey: ["canhoes", "admin", "members", eventId],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
  });

  const secretSantaQuery = useQuery({
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.adminGetSecretSantaState(eventId!),
    queryKey: ["canhoes", "admin", "secret-santa-state", eventId],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
  });

  if (!eventId) {
    return <AdminStateMessage>Falta uma edicao ativa para gerir amigos.</AdminStateMessage>;
  }

  if (loading || membersQuery.isLoading || secretSantaQuery.isLoading) {
    return <AdminStateMessage>A carregar membros...</AdminStateMessage>;
  }

  const queryError = membersQuery.error ?? secretSantaQuery.error;

  if (queryError) {
    logFrontendError("AdminMembersSection.query", queryError, { eventId });
    return (
      <AdminStateMessage
        tone="error"
        action={
          <Button onClick={() => void Promise.all([membersQuery.refetch(), secretSantaQuery.refetch()])}>
            Tentar novamente
          </Button>
        }
      >
        Nao foi possivel carregar os membros desta edicao.
      </AdminStateMessage>
    );
  }

  const members = membersQuery.data ?? [];

  return (
    <div className="space-y-4">
      <SecretSantaAdmin
        activeEventName={activeEventName}
        eventId={eventId}
        loading={loading}
        onUpdate={onUpdate}
        state={secretSantaQuery.data ?? null}
      />

      <Card className="canhoes-paper-panel">
        <CardHeader className="space-y-1">
          <p className="editorial-kicker">Roster</p>
          <CardTitle>
            {members.length} {members.length === 1 ? "membro" : "membros"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <AdminStateMessage>Nenhum membro nesta edicao.</AdminStateMessage>
          ) : (
            <div className="max-h-[60svh] rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)]">
              <VirtualizedList
                className="px-1 py-1"
                estimateSize={() => 56}
                items={members}
                renderItem={(member) => (
                  <div className="flex items-center justify-between rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper)] min-h-11 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--ink-primary)]">
                        {member.displayName || member.email}
                      </p>
                      <p className="text-xs text-[var(--ink-muted)]">{member.email}</p>
                    </div>
                    {member.isAdmin ? (
                      <Badge variant="outline" className="shrink-0">
                        Admin
                      </Badge>
                    ) : null}
                  </div>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
