"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { FeedReaction } from "@/lib/reactions";

type ReactionPickerProps = {
  reactions: readonly FeedReaction[];
  myReactions: string[];
  onToggle: (emoji: string) => void;
  trigger: (open: () => void) => React.ReactNode;
};

/**
 * ReactionPicker — Facebook/LinkedIn-style animated emoji picker.
 *
 * Opens on hover (desktop) or long-press (mobile), shows all available
 * reactions with spring stagger animation, and displays labels on hover.
 */
export function ReactionPicker({
  reactions,
  myReactions,
  onToggle,
  trigger,
}: Readonly<ReactionPickerProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    setHoveredEmoji(null);
  };

  const handleMouseEnter = () => {
    hoverTimerRef.current = setTimeout(() => setIsOpen(true), 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    // Delay close slightly to allow moving cursor to picker
    hoverTimerRef.current = setTimeout(() => {
      if (!hoverTimerRef.current) return; // Already cleared
      close();
    }, 500);
  };

  const handlePointerDown = () => {
    longPressRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 400);
  };

  const handlePointerUp = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const handleReactionClick = (emoji: string) => {
    onToggle(emoji);
    close();
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Trigger button */}
      {trigger(open)}

      {/* Picker popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute bottom-full left-0 z-50 mb-2",
              "rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-deep)] p-2 shadow-xl backdrop-blur-sm"
            )}
            onMouseEnter={() => {
              if (hoverTimerRef.current) {
                clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = null;
              }
            }}
            onMouseLeave={() => {
              close();
            }}
          >
            <div className="flex gap-1">
              {reactions.map((reaction, index) => {
                const { emoji, label } = reaction;
                const isActive = myReactions.includes(emoji);
                const isHovered = hoveredEmoji === emoji;

                return (
                  <motion.button
                    key={emoji}
                    type="button"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 18,
                      delay: index * 0.04,
                    }}
                    whileHover={{ scale: 1.35, y: -6 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleReactionClick(emoji)}
                    onMouseEnter={() => setHoveredEmoji(emoji)}
                    onMouseLeave={() => setHoveredEmoji(null)}
                    className={cn(
                      "relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-xl transition-shadow",
                      isActive
                        ? "ring-2 ring-[var(--moss-glow)] ring-offset-1 ring-offset-[var(--bg-deep)]"
                        : "hover:bg-[rgba(255,255,255,0.06)]"
                    )}
                    aria-label={label}
                  >
                    {emoji}

                    {/* Label tooltip on hover */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.span
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.12 }}
                          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-primary)] shadow-sm"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
