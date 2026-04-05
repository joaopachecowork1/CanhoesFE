"use client";

import type { PublicUserDto } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStateMessage } from "./AdminStateMessage";

type AdminMembersSectionProps = {
  loading: boolean;
  members: PublicUserDto[];
};

export function AdminMembersSection({
  loading,
  members,
}: Readonly<AdminMembersSectionProps>) {
  if (loading) {
    return <AdminStateMessage>A carregar membros...</AdminStateMessage>;
  }

  if (members.length === 0) {
    return <AdminStateMessage>Nenhum membro nesta edicao.</AdminStateMessage>;
  }

  return (
    <Card className="border-[var(--color-moss)]/20 bg-[rgba(16,20,11,0.9)]">
      <CardHeader className="space-y-1">
        <p className="editorial-kicker">Membros</p>
        <CardTitle>
          {members.length} {members.length === 1 ? "membro" : "membros"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[60svh] space-y-2 overflow-y-auto pr-1">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.12)] bg-[rgba(11,14,8,0.72)] px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--bg-paper)]">
                  {member.displayName || member.email}
                </p>
                <p className="text-xs text-[rgba(245,237,224,0.64)]">{member.email}</p>
              </div>
              {member.isAdmin && (
                <Badge variant="outline" className="shrink-0">Admin</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
