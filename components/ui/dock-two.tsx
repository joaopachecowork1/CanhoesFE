"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type DockItem = {
  ariaLabel?: string;
  ariaPressed?: boolean;
  buttonClassName?: string;
  icon: LucideIcon;
  iconClassName?: string;
  isActive?: boolean;
  label: string;
  onClick?: () => void;
};

type DockProps = {
  className?: string;
  dockClassName?: string;
  items: readonly DockItem[];
};

const DockButton = React.forwardRef<HTMLButtonElement, DockItem>(
  ({ ariaLabel, ariaPressed, buttonClassName, icon: Icon, iconClassName, isActive, label, onClick }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-current={isActive && !ariaPressed ? "page" : undefined}
        aria-pressed={ariaPressed}
        aria-label={ariaLabel ?? label}
        className={cn(
          "flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-[0.95rem] border px-2 py-2 text-[11px] font-semibold leading-none transition-colors active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neon-green)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-void)]",
          isActive
            ? "border-[rgba(122,173,58,0.24)] bg-[rgba(122,173,58,0.12)] text-[var(--bg-paper)]"
            : "border-transparent bg-transparent text-[rgba(245,237,224,0.82)] hover:bg-[rgba(245,237,224,0.06)]",
          buttonClassName
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0", iconClassName)} />
        <span className="truncate font-[var(--font-mono)] text-[10px] uppercase tracking-[0.06em]">
          {label}
        </span>
      </button>
    );
  }
);

DockButton.displayName = "DockButton";

const Dock = React.forwardRef<HTMLDivElement, DockProps>(({ className, dockClassName, items }, ref) => {
  return (
    <div ref={ref} className={cn("w-full", className)}>
      <div
        className={cn("grid w-full gap-1.5", dockClassName)}
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <DockButton key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
});

Dock.displayName = "Dock";

export { Dock };
