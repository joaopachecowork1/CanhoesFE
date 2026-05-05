"use client";

import { Smile } from "lucide-react";
import { Button } from "./button";
import { ReactionPicker } from "@/components/modules/hub/components/ReactionPicker";
import { HUB_REACTIONS } from "@/lib/reactions";
import { cn } from "@/lib/utils";

export interface ReactionBarProps {
  emojis: readonly string[];
  reactionCounts: Record<string, number>;
  myReactions: string[];
  onToggle: (emoji: string) => void;
  className?: string;
}

/**
 * ReactionBar — social-feed style emoji reactions for comments.
 *
 * Displays active reactions as compact pills (emoji + count).
 * Uses the animated ReactionPicker for the "+" button to add more reactions.
 */
export function ReactionBar({
  emojis,
  reactionCounts,
  myReactions,
  onToggle,
  className,
}: Readonly<ReactionBarProps>) {
  const activePills = emojis.filter(
    (emoji) => (reactionCounts[emoji] ?? 0) > 0 || myReactions.includes(emoji)
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {activePills.map((emoji) => {
        const isActive = myReactions.includes(emoji);
        const count = reactionCounts[emoji] ?? 0;

        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onToggle(emoji)}
            className={cn(
              "inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] font-medium transition-[transform,background-color,border-color,color,box-shadow] hover:-translate-y-[1px]",
              isActive
                ? "border-[rgba(122,173,58,0.52)] bg-[rgba(122,173,58,0.18)] text-[var(--bg-paper)] [box-shadow:var(--glow-green-sm)]"
                : "border-[var(--border-subtle)] bg-[rgba(255,255,255,0.06)] text-[rgba(242,234,216,0.8)] hover:bg-[rgba(255,255,255,0.12)] hover:text-[var(--bg-paper)]"
            )}
          >
            <span>{emoji}</span>
            <span className="tabular-nums">{count}</span>
          </button>
        );
      })}

      {/* Animated reaction picker */}
      <ReactionPicker
        reactions={HUB_REACTIONS}
        myReactions={myReactions}
        onToggle={onToggle}
        trigger={(open) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 rounded-full border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.06)] p-0 text-[rgba(242,234,216,0.76)] hover:bg-[rgba(255,255,255,0.12)] hover:text-[var(--bg-paper)]"
            onClick={open}
            aria-label="Adicionar reação"
          >
            <Smile className="h-3.5 w-3.5" />
          </Button>
        )}
      />
    </div>
  );
}
