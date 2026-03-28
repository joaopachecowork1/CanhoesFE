"use client";

import { MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export const HUB_EMOJIS = ["\u2764\uFE0F", "\uD83D\uDD25", "\uD83D\uDE02"] as const;
const HUB_EMOJI_LABELS = ["\u2764\uFE0F", "\uD83D\uDD25", "\uD83D\uDE02"] as const;

export function ReactionRail({
  emojis = HUB_EMOJIS,
  myReactions,
  reactionCounts,
  likeCount,
  commentCount,
  onToggleReaction,
  onToggleComments,
}: Readonly<{
  emojis?: readonly string[];
  myReactions: string[];
  reactionCounts: Record<string, number> | undefined;
  likeCount: number | undefined;
  commentCount: number | undefined;
  onToggleReaction: (emoji: string) => void;
  onToggleComments: () => void;
}>) {
  const counts = reactionCounts || {};
  const myReactionSet = new Set(myReactions || []);

  return (
    <div className="flex w-14 shrink-0 flex-col items-center gap-2 border-r border-[var(--border-paper)] bg-[var(--bg-paper-alt)]/65 p-2">
      {emojis.map((emoji, emojiIndex) => {
        const isActive = myReactionSet.has(emoji);
        const reactionCount = counts[emoji] ?? (emojiIndex === 0 ? likeCount ?? 0 : 0);

        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onToggleReaction(emoji)}
            className={cn(
              "canhoes-tap flex w-full flex-col items-center gap-1 rounded-xl border px-1 py-2 text-xs",
              isActive
                ? "border-[var(--border-moss)] bg-[var(--bg-paper)] text-[var(--text-dark)] shadow-[var(--shadow-card)]"
                : "border-[var(--border-paper)] bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--bg-paper)]"
            )}
          >
            <span className="text-base leading-none">{HUB_EMOJI_LABELS[emojiIndex]}</span>
            <span className="font-medium">{reactionCount}</span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={onToggleComments}
        className="canhoes-tap flex w-full flex-col items-center gap-1 rounded-xl border border-[var(--border-paper)] px-1 py-2 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--bg-paper)]"
        title="Comentarios"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="font-medium">{commentCount ?? 0}</span>
      </button>
    </div>
  );
}
