import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Inline loading spinner with centered layout and optional label.
 */
export function InlineLoader({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-deep)] px-4 py-6 text-sm text-[var(--text-muted)]",
        className
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin text-[var(--color-moss)]" />
      {label ? <span>{label}</span> : null}
    </div>
  );
}
