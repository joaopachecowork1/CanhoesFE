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
    queryFn: () => canhoesEventsRepo.loadAdminMembersPage(eventId!, 0, 50),
    queryKey: ["canhoes", "admin", "members", eventId, 0, 50],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
    select: (page) => page.items,
  });

  const secretSantaQuery = useQuery({
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.adminGetSecretSantaState(eventId!),
    queryKey: ["canhoes", "admin", "secret-santa-state", eventId],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
  });

  const members = membersQuery.data ?? [];

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

  return (
    <div className="space-y-4">
      <SecretSantaAdmin
        activeEventName={activeEventName}
        eventId={eventId}
        loading={loading}
        onUpdate={onUpdate}
        state={secretSantaQuery.data ?? null}
      />

      <Card className="canhoes-paper-panel border border-[rgba(122,173,58,0.12)] bg-[rgba(15,22,10,0.96)] shadow-[0_16px_32px_rgba(0,0,0,0.14)]">
        <CardHeader className="space-y-1">
          <p className="editorial-kicker">Roster</p>
          <CardTitle>{members.length} {members.length === 1 ? "membro" : "membros"}</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <AdminStateMessage>Nenhum membro nesta edição.</AdminStateMessage>
          ) : (
            <div className="max-h-[60svh] rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(16,23,11,0.94)] shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
              <VirtualizedList
                className="px-1 py-1"
                estimateSize={() => 56}
                items={members}
                renderItem={(member) => (
                  <div className="flex items-center justify-between rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(22,28,15,0.92)] min-h-11 px-3 py-2 shadow-[0_6px_14px_rgba(0,0,0,0.06)]">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--ink-primary)]">{member.displayName || member.email}</p>
                      <p className="text-xs text-[var(--ink-muted)]">{member.email}</p>
                    </div>
                    {member.isAdmin ? <Badge variant="outline" className="shrink-0">Admin</Badge> : null}
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
