"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type DockItem = {
  ariaLabel?: string;
  buttonClassName?: string;
  icon: LucideIcon;
  iconClassName?: string;
  isActive?: boolean;
  label: string;
  onClick?: () => void;
  tooltipClassName?: string;
};

type DockProps = {
  className?: string;
  containerClassName?: string;
  dockClassName?: string;
  items: readonly DockItem[];
};

type DockIconButtonProps = DockItem;

const DockIconButton = React.forwardRef<HTMLButtonElement, DockIconButtonProps>(
  (
    {
      ariaLabel,
      buttonClassName,
      icon: Icon,
      iconClassName,
      isActive,
      label,
      onClick,
      tooltipClassName,
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion();

    return (
      <motion.button
        ref={ref}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97, y: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.65 }}
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
        aria-label={ariaLabel ?? label}
        title={label}
        className={cn(
          "group relative inline-flex min-w-[4.25rem] snap-center flex-col items-center justify-center gap-1 rounded-[1rem] px-2 py-2 transition-colors hover:bg-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          buttonClassName
        )}
      >
        <Icon className={cn("h-5 w-5 text-foreground", iconClassName)} />
        <span className="pointer-events-none max-w-full truncate px-1 text-center font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.08em] text-current">
          {label}
        </span>
        <span
          className={cn(
            "pointer-events-none absolute bottom-1 h-1 rounded-full bg-[var(--neon-green)] transition-[width,opacity,box-shadow] duration-200",
            isActive ? "w-6 opacity-100 [box-shadow:var(--glow-green-sm)]" : "w-2 opacity-0"
          )}
        />
        <span
          className={cn(
            "pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:hidden",
            tooltipClassName
          )}
        >
          {label}
        </span>
      </motion.button>
    );
  }
);

DockIconButton.displayName = "DockIconButton";

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ className, containerClassName, dockClassName, items }, ref) => {
    const prefersReducedMotion = useReducedMotion();

    return (
      <div
        ref={ref}
        className={cn("flex w-full items-center justify-center", className)}
      >
        <div
          className={cn(
            "relative flex w-full snap-x snap-mandatory items-center justify-center overflow-x-auto scrollbar-none overscroll-x-contain touch-pan-x",
            containerClassName
          )}
        >
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className={cn(
              "flex w-max items-center gap-1 rounded-2xl border bg-background/90 p-2 shadow-lg backdrop-blur-lg transition-shadow duration-300 hover:shadow-xl",
              "border-border",
              dockClassName
            )}
          >
            {items.map((item) => (
              <DockIconButton key={item.label} {...item} />
            ))}
          </motion.div>
        </div>
      </div>
    );
  }
);

Dock.displayName = "Dock";

export { Dock };
