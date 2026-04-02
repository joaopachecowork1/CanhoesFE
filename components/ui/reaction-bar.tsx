"use client";

import { Smile } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface ReactionBarProps {
  emojis: readonly string[];
  reactionCounts: Record<string, number>;
  myReactions: string[];
  onToggle: (emoji: string) => void;
  className?: string;
}

/**
 * ReactionBar — social-feed style emoji reactions.
 *
 * Displays active reactions as compact pills (emoji + count).
 * A "+" Popover (shadcn) opens an emoji picker to add or remove reactions.
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
              "inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] font-medium transition-colors",
              isActive
                ? "border-[rgba(122,173,58,0.5)] bg-[rgba(122,173,58,0.15)] text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.1)] hover:text-[var(--text-primary)]"
            )}
          >
            <span>{emoji}</span>
            <span className="tabular-nums">{count}</span>
          </button>
        );
      })}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 rounded-full border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.04)] p-0 text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.1)] hover:text-[var(--text-primary)]"
            aria-label="Adicionar reação"
          >
            <Smile className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-auto min-w-0 rounded-2xl border border-[var(--border-subtle)] bg-[rgba(22,28,14,0.97)] p-2 shadow-lg backdrop-blur-sm"
        >
          <div className="flex gap-1">
            {emojis.map((emoji) => {
              const isActive = myReactions.includes(emoji);

              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onToggle(emoji)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-all hover:scale-110 active:scale-95",
                    isActive
                      ? "bg-[rgba(122,173,58,0.2)] ring-1 ring-[rgba(122,173,58,0.5)]"
                      : "hover:bg-[rgba(255,255,255,0.08)]"
                  )}
                  title={emoji}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
