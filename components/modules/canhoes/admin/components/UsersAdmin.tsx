"use client";

import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { adminCopy } from "@/lib/canhoesCopy";
import type { PublicUserDto } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import { AdminCollapsibleSection } from "./AdminCollapsibleSection";

type UsersAdminProps = {
  loading: boolean;
  members: PublicUserDto[];
};

function getMemberInitials(member: PublicUserDto) {
  return (member.displayName ?? member.email)
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function MemberRowSkeleton() {
  return (
    <div className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-4 py-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3.5 w-40 rounded" />
        </div>
      </div>
    </div>
  );
}

function MemberRow({ member }: Readonly<{ member: PublicUserDto }>) {
  return (
    <article className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-4 py-4 text-[var(--bg-paper)]">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
            member.isAdmin
              ? "border-[rgba(122,173,58,0.32)] bg-[rgba(122,173,58,0.18)] text-[var(--bg-paper)]"
              : "border-[rgba(212,184,150,0.18)] bg-[rgba(18,23,12,0.74)] text-[rgba(245,237,224,0.86)]"
          )}
        >
          {getMemberInitials(member) || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--bg-paper)]">
            {member.displayName ?? "Sem nome"}
          </p>
          <p className="body-small truncate text-[rgba(245,237,224,0.66)]">{member.email}</p>
        </div>

        {member.isAdmin ? <Badge variant="secondary">Admin</Badge> : null}
      </div>
    </article>
  );
}

export function UsersAdmin({ loading, members }: Readonly<UsersAdminProps>) {
  const adminMembers = members.filter((member) => member.isAdmin);
  const regularMembers = members.filter((member) => !member.isAdmin);

  return (
    <div className="space-y-5">
      <section className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.14),transparent_34%),linear-gradient(180deg,rgba(18,24,11,0.95),rgba(11,14,8,0.97))] px-4 py-4 text-[var(--bg-paper)] shadow-[var(--shadow-panel)] sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(122,173,58,0.24)] bg-[rgba(122,173,58,0.16)] text-[var(--bg-paper)]">
            <Users className="h-5 w-5" />
          </div>

          <div>
            <p className="heading-3 text-[var(--bg-paper)]">
              {adminCopy.users.title} ({loading ? "..." : members.length})
            </p>
            <p className="body-small text-[rgba(245,237,224,0.66)]">
              {loading
                ? adminCopy.users.loading
                : `${adminMembers.length} admins · ${regularMembers.length} membros`}
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="space-y-2">
          {["one", "two", "three", "four"].map((slot) => (
            <MemberRowSkeleton key={slot} />
          ))}
        </div>
      ) : null}

      {!loading && adminMembers.length > 0 ? (
        <AdminCollapsibleSection
          kicker="Administracao"
          title={adminCopy.users.admins}
          count={adminMembers.length}
          defaultOpen
        >
          {adminMembers.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </AdminCollapsibleSection>
      ) : null}

      {!loading && regularMembers.length > 0 ? (
        <AdminCollapsibleSection
          kicker="Grupo"
          title={adminCopy.users.members}
          count={regularMembers.length}
        >
          {regularMembers.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </AdminCollapsibleSection>
      ) : null}

      {!loading && members.length === 0 ? (
        <p className="body-small py-10 text-center text-[rgba(245,237,224,0.66)]">
          {adminCopy.users.empty}
        </p>
      ) : null}
    </div>
  );
}
