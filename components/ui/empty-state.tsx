import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { CanhoesDecorativeDivider, CanhoesGlowBackdrop } from "@/components/ui/canhoes-bits";

/**
 * Empty state with icon, title, optional description and action.
 */
export function EmptyState({
  action,
  className,
  description,
  icon: Icon,
  tone = "shell",
  title,
}: {
  action?: React.ReactNode;
  className?: string;
  description?: string;
  icon?: LucideIcon;
  tone?: "admin" | "official" | "shell" | "social";
  title: string;
}) {
  return (
    <div
      className={cn(
        "canhoes-bits-panel relative flex flex-col items-center justify-center gap-4 rounded-[var(--radius-lg-token)] border px-6 py-10 text-center",
        tone === "social" && "canhoes-bits-panel--social",
        tone === "official" && "canhoes-bits-panel--official",
        tone === "admin" && "canhoes-bits-panel--admin",
        tone === "shell" && "canhoes-bits-panel--shell",
        className
      )}
    >
      <CanhoesGlowBackdrop tone={tone} />

      {Icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(245,237,224,0.08)] bg-[rgba(245,237,224,0.06)] text-[var(--neon-green)] shadow-[0_0_24px_rgba(0,255,136,0.08)]">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}

      <div className="space-y-2">
        <p
          className={cn(
            "text-sm font-semibold",
            tone === "admin" ? "text-[var(--ink-primary)]" : "text-[var(--bg-paper)]"
          )}
        >
          {title}
        </p>
        {description ? (
          <p
            className={cn(
              "text-sm",
              tone === "admin" ? "text-[var(--ink-muted)]" : "text-[var(--text-muted)]"
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {(description || action) ? <CanhoesDecorativeDivider tone="moss" className="max-w-40" /> : null}

      {action ? <div className="w-full max-w-xs">{action}</div> : null}
    </div>
  );
}
