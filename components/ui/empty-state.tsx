import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Empty state with icon, title, optional description and action.
 */
export function EmptyState({
  action,
  className,
  description,
  icon: Icon,
  title,
}: {
  action?: React.ReactNode;
  className?: string;
  description?: string;
  icon?: LucideIcon;
  title: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg-token)] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-deep)] px-6 py-10 text-center",
        className
      )}
    >
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-moss)]/12 text-[var(--color-moss)]">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}

      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--bg-paper)]">{title}</p>
        {description ? (
          <p className="text-sm text-[var(--text-muted)]">{description}</p>
        ) : null}
      </div>

      {action}
    </div>
  );
}
