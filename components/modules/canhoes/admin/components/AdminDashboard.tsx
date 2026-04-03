"use client";

import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { adminCopy } from "@/lib/canhoesCopy";
import type {
  CategoryProposalDto,
  MeasureProposalDto,
  NomineeDto,
} from "@/lib/api/types";

import { AdminCollapsibleSection } from "./AdminCollapsibleSection";

type AdminDashboardProps = {
  allNominees: NomineeDto[];
  loading: boolean;
  pendingCategoryProposals: CategoryProposalDto[];
  pendingMeasureProposals: MeasureProposalDto[];
  pendingNominees: NomineeDto[];
};

const PENDING_BADGE_LABELS = [
  { key: "nominees", suffix: "nomeacoes pendentes" },
  { key: "categories", suffix: "propostas de categoria" },
  { key: "measures", suffix: "medidas propostas" },
] as const;

function getNomineeBadgeVariant(status: NomineeDto["status"]) {
  if (status === "approved") return "default" as const;
  if (status === "rejected") return "destructive" as const;
  return "outline" as const;
}

function PendingReviewBadges({
  nomineesCount,
  categoryProposalsCount,
  measureProposalsCount,
}: Readonly<{
  nomineesCount: number;
  categoryProposalsCount: number;
  measureProposalsCount: number;
}>) {
  const items = {
    nominees: nomineesCount,
    categories: categoryProposalsCount,
    measures: measureProposalsCount,
  } as const;

  return (
    <>
      {PENDING_BADGE_LABELS.map((item) =>
        items[item.key] > 0 ? (
          <Badge key={item.key} variant="secondary">
            {items[item.key]} {item.suffix}
          </Badge>
        ) : null
      )}
    </>
  );
}

export function AdminDashboard({
  allNominees,
  loading,
  pendingCategoryProposals,
  pendingMeasureProposals,
  pendingNominees,
}: Readonly<AdminDashboardProps>) {
  const safeAllNominees = allNominees ?? [];
  const safePendingCategoryProposals = pendingCategoryProposals ?? [];
  const safePendingMeasureProposals = pendingMeasureProposals ?? [];
  const safePendingNominees = pendingNominees ?? [];

  const pendingReviews =
    safePendingNominees.length +
    safePendingCategoryProposals.length +
    safePendingMeasureProposals.length;

  const recentNominees = [...safeAllNominees]
    .sort(
      (left, right) =>
        new Date(right.createdAtUtc).getTime() -
        new Date(left.createdAtUtc).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {!loading && pendingReviews > 0 ? (
        <section className="rounded-[var(--radius-lg-token)] border border-[rgba(224,90,58,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(224,90,58,0.12),transparent_34%),linear-gradient(180deg,rgba(30,18,12,0.94),rgba(17,11,8,0.96))] px-4 py-4 text-[var(--bg-paper)] shadow-[var(--shadow-panel)] sm:px-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[var(--neon-amber)]">
              <AlertTriangle className="h-4 w-4" />
              <span className="editorial-kicker text-[var(--neon-amber)]">
                {adminCopy.dashboard.queueKicker}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="heading-3 text-[var(--bg-paper)]">
                {adminCopy.dashboard.queueTitle}
              </h3>
              <div className="flex flex-wrap gap-2">
                <PendingReviewBadges
                  nomineesCount={safePendingNominees.length}
                  categoryProposalsCount={safePendingCategoryProposals.length}
                  measureProposalsCount={safePendingMeasureProposals.length}
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {!loading && recentNominees.length > 0 ? (
        <AdminCollapsibleSection
          kicker={adminCopy.dashboard.recentKicker}
          title={adminCopy.dashboard.recentTitle}
          count={recentNominees.length}
        >
          {recentNominees.map((nominee) => (
            <article
              key={nominee.id}
              className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-4 py-4 text-[var(--bg-paper)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-semibold text-[var(--bg-paper)]">
                    {nominee.title}
                  </p>
                  <p className="text-xs text-[rgba(245,237,224,0.66)]">
                    {new Date(nominee.createdAtUtc).toLocaleDateString("pt-PT", {
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>

                <Badge
                  variant={getNomineeBadgeVariant(nominee.status)}
                >
                  {nominee.status}
                </Badge>
              </div>
            </article>
          ))}
        </AdminCollapsibleSection>
      ) : null}
    </div>
  );
}
