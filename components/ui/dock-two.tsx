"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type DockItem = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
};

type DockProps = {
  className?: string;
  items: readonly DockItem[];
};

type DockIconButtonProps = DockItem & {
  className?: string;
};

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
  ({ icon: Icon, label, onClick, className }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn(
          "group relative rounded-lg p-3 transition-colors hover:bg-secondary",
          className
        )}
      >
        <Icon className="h-5 w-5 text-foreground" />
        <span
          className={cn(
            "pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 transition-opacity group-hover:opacity-100"
          )}
        >
          {label}
        </span>
      </motion.button>
    );
  }
);

DockIconButton.displayName = "DockIconButton";

const Dock = React.forwardRef<HTMLDivElement, DockProps>(({ items, className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex h-64 w-full items-center justify-center p-2", className)}
    >
      <div className="relative flex h-64 w-full max-w-4xl items-center justify-center rounded-2xl">
        <motion.div
          initial="initial"
          animate="animate"
          variants={floatingAnimation}
          className={cn(
            "flex items-center gap-1 rounded-2xl border bg-background/90 p-2 shadow-lg backdrop-blur-lg transition-shadow duration-300 hover:shadow-xl",
            "border-border"
          )}
        >
          {items.map((item) => (
            <DockIconButton key={item.label} {...item} />
          ))}
        </motion.div>
      </div>
    </div>
  );
});

Dock.displayName = "Dock";

export { Dock };
