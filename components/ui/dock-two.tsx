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

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

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
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
        aria-label={ariaLabel ?? label}
        title={label}
        className={cn(
          "group relative rounded-lg p-3 transition-colors hover:bg-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          buttonClassName
        )}
      >
        <Icon className={cn("h-5 w-5 text-foreground", iconClassName)} />
        <span
          className={cn(
            "pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
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
        className={cn("flex h-64 w-full items-center justify-center p-2", className)}
      >
        <div
          className={cn(
            "relative flex h-64 w-full max-w-4xl items-center justify-center rounded-2xl",
            containerClassName
          )}
        >
          <motion.div
            initial={prefersReducedMotion ? undefined : "initial"}
            animate={prefersReducedMotion ? undefined : "animate"}
            variants={prefersReducedMotion ? undefined : floatingAnimation}
            className={cn(
              "flex items-center gap-1 rounded-2xl border bg-background/90 p-2 shadow-lg backdrop-blur-lg transition-shadow duration-300 hover:shadow-xl",
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
