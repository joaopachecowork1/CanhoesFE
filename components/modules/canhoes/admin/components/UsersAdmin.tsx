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
    <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-4 py-3">
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
    <article className="canhoes-paper-card rounded-[var(--radius-md-token)] px-4 py-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
            member.isAdmin
              ? "border-[rgba(74,92,47,0.28)] bg-[rgba(74,92,47,0.12)] text-[var(--moss)]"
              : "border-[rgba(107,76,42,0.16)] bg-[rgba(107,76,42,0.06)] text-[var(--bark)]"
          )}
        >
          {getMemberInitials(member) || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--text-ink)]">
            {member.displayName ?? "Sem nome"}
          </p>
          <p className="body-small truncate text-[var(--bark)]/68">{member.email}</p>
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
    <div className="space-y-4">
      <section className="canhoes-paper-panel rounded-[var(--radius-lg-token)] px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(74,92,47,0.2)] bg-[rgba(74,92,47,0.08)] text-[var(--moss)]">
            <Users className="h-5 w-5" />
          </div>

          <div>
            <p className="heading-3 text-[var(--text-ink)]">
              {adminCopy.users.title} ({loading ? "..." : members.length})
            </p>
            <p className="body-small text-[var(--bark)]/68">
              {loading
                ? adminCopy.users.loading
                : `${adminMembers.length} admins · ${regularMembers.length} membros`}
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <MemberRowSkeleton key={index} />
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
        <p className="body-small py-10 text-center text-[var(--bark)]/68">
          {adminCopy.users.empty}
        </p>
      ) : null}
    </div>
  );
}
