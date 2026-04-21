"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { FeedReaction } from "@/lib/reactions";

type ReactionPickerProps = {
  reactions: readonly FeedReaction[];
  myReactions: string[];
  onToggle: (emoji: string) => void;
  trigger: (open: () => void) => React.ReactNode;
};

const REACTION_COLLECTIONS: Array<{ label: string; emojis: readonly string[] }> = [
  { label: "Favoritos", emojis: ["❤️", "🔥", "😂", "👏"] },
  { label: "Reações", emojis: ["😮", "😢", "👍"] },
];

export function ReactionPicker({
  reactions,
  myReactions,
  onToggle,
  trigger,
}: Readonly<ReactionPickerProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  const reactionsByEmoji = new Map(reactions.map((reaction) => [reaction.emoji, reaction]));

  const handleToggle = (emoji: string) => {
    onToggle(emoji);
    setIsOpen(false);
    setHoveredEmoji(null);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger(() => setIsOpen(true))}
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={10}
        className={cn(
          "w-[min(92vw,22rem)] surface-panel-soft p-3 text-[var(--text-primary)]"
        )}
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="editorial-kicker text-[var(--ink-muted)]">Reações</p>
            <p className="text-sm text-[var(--text-muted)]">Escolhe uma reação rápida</p>
          </div>

          {REACTION_COLLECTIONS.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                {group.label}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {group.emojis.map((emoji) => {
                  const reaction = reactionsByEmoji.get(emoji);
                  if (!reaction) return null;

                  const isActive = myReactions.includes(emoji);
                  const isHovered = hoveredEmoji === emoji;

                  return (
                    <motion.button
                      key={emoji}
                      type="button"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.06, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => handleToggle(emoji)}
                      onMouseEnter={() => setHoveredEmoji(emoji)}
                      onMouseLeave={() => setHoveredEmoji(null)}
                      className={cn(
                        "relative flex h-16 items-center justify-center rounded-2xl border text-2xl transition-colors",
                        isActive
                          ? "border-[var(--border-neon)] bg-[rgba(122,173,58,0.14)] shadow-[var(--glow-green-sm)]"
                          : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-deep)]"
                      )}
                      aria-label={reaction.label}
                    >
                      {emoji}

                      <AnimatePresence>
                        {isHovered ? (
                          <motion.span
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.12 }}
                            className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-primary)] shadow-sm"
                          >
                            {reaction.label}
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
