"use client";

import type {
  EventAdminSecretSantaStateDto,
  PublicUserDto,
} from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VirtualizedList } from "@/components/ui/virtualized-list";
import { AdminStateMessage } from "./AdminStateMessage";
import { SecretSantaAdmin } from "./SecretSantaAdmin";

type AdminMembersSectionProps = {
  activeEventName: string | null;
  eventId: string | null;
  loading: boolean;
  members: PublicUserDto[];
  onUpdate: () => Promise<void>;
  secretSantaState: EventAdminSecretSantaStateDto | null;
};

export function AdminMembersSection({
  activeEventName,
  eventId,
  loading,
  members,
  onUpdate,
  secretSantaState,
}: Readonly<AdminMembersSectionProps>) {
  if (!eventId) {
    return <AdminStateMessage>Falta uma edicao ativa para gerir amigos.</AdminStateMessage>;
  }

  return (
    <div className="space-y-4">
      <SecretSantaAdmin
        activeEventName={activeEventName}
        eventId={eventId}
        loading={loading}
        onUpdate={onUpdate}
        state={secretSantaState}
      />

      <Card className="border-[var(--border-subtle)] bg-[var(--bg-paper)]">
        <CardHeader className="space-y-1">
          <p className="editorial-kicker text-[var(--moss-glow)]">Roster</p>
          <CardTitle className="text-[var(--ink-primary)]">
            {members.length} {members.length === 1 ? "membro" : "membros"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <AdminStateMessage>A carregar membros...</AdminStateMessage> : null}

          {!loading && members.length === 0 ? (
            <AdminStateMessage>Nenhum membro nesta edicao.</AdminStateMessage>
          ) : null}

          {!loading && members.length > 0 ? (
            <div className="max-h-[60svh] rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)]">
              <VirtualizedList
                className="px-1 py-1"
                estimateSize={() => 56}
                items={members}
                renderItem={(member) => (
                  <div
                    className="flex items-center justify-between rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] min-h-11 px-3 py-2"
                  >
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
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
