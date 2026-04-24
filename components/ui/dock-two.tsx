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
          "relative flex min-h-[3.375rem] w-full flex-col items-center justify-center gap-1 rounded-[0.95rem] border px-2 py-2 text-[11px] font-semibold leading-none transition-colors active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--moss)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-void)]",
          isActive
            ? "border-[rgba(95,123,56,0.22)] bg-[rgba(95,123,56,0.14)] text-[var(--bg-paper)]"
            : "border-transparent bg-transparent text-[rgba(243,234,216,0.78)] hover:bg-[rgba(244,234,216,0.06)]",
          buttonClassName
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0", iconClassName)} />
        <span className="truncate font-[var(--font-mono)] text-[10px] uppercase tracking-[0.08em]">
          {label}
        </span>
        {isActive && (
          <span className="absolute bottom-1.5 h-0.5 w-4 rounded-full bg-canhoes-gold/70" />
        )}
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
