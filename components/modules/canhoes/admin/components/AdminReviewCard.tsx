import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export function AdminReviewCard({
  actions,
  children,
  meta,
  status,
  title,
}: Readonly<{
  actions?: ReactNode;
  children?: ReactNode;
  meta?: string;
  status?: ReactNode;
  title: string;
}>) {
  return (
    <article className="relative overflow-hidden rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] px-4 py-3.5 text-[var(--ink-primary)] shadow-[var(--shadow-paper)]">
      <div className="relative space-y-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="heading-3 text-[var(--ink-primary)]">{title}</h3>
                {status}
              </div>
              {meta ? (
                <Badge
                  variant="outline"
                  className="w-fit border-[var(--border-subtle)] bg-[var(--bg-paper)] text-[0.75rem] text-[var(--ink-muted)] shadow-none"
                >
                  {meta}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        {children ? <div className="space-y-3">{children}</div> : null}

        {actions ? (
          <div className="mt-2 flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-3 sm:flex-row sm:flex-wrap sm:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </article>
  );
}
