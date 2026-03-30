"use client";

import { Badge } from "@/components/ui/badge";

type AdminReviewCardProps = {
  actions?: React.ReactNode;
  children?: React.ReactNode;
  meta?: string;
  status?: React.ReactNode;
  title: string;
};

export function AdminReviewCard({
  actions,
  children,
  meta,
  status,
  title,
}: Readonly<AdminReviewCardProps>) {
  return (
    <article className="canhoes-paper-card relative overflow-hidden rounded-[var(--radius-md-token)] px-4 py-4 shadow-[var(--shadow-paper-soft)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.18),transparent_32%)]" />
      <div className="relative space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="heading-3 text-[var(--text-ink)]">{title}</h3>
              {status}
            </div>
            {meta ? (
              <Badge
                variant="outline"
                className="w-fit border-[var(--border-purple)] bg-[rgba(177,140,255,0.14)] text-[var(--accent-purple-deep)] shadow-[var(--glow-purple-sm)]"
              >
                {meta}
              </Badge>
            ) : null}
          </div>

          {actions ? <div className="flex flex-wrap gap-2 sm:justify-end">{actions}</div> : null}
        </div>

        {children ? <div className="space-y-3">{children}</div> : null}
      </div>
    </article>
  );
}
