"use client";

import { NumberTicker } from "@/components/animations/NumberTicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { feedCopy } from "@/lib/canhoesCopy";
import { HUB_REACTIONS, QUICK_REACTIONS } from "@/lib/reactions";
import { ReactionPicker } from "./ReactionPicker";

const reactionButtonGroupClassName =
  "flex flex-wrap gap-1.5 [&>button]:border-[rgba(74,92,47,0.3)] [&>button]:bg-[rgba(255,255,255,0.07)] [&>button]:text-[var(--bg-paper)] [&>button]:shadow-[0_8px_18px_rgba(0,0,0,0.14)] [&>button:hover]:bg-[rgba(255,255,255,0.12)]";

type HubPostActionsProps = {
  postId: string;
  commentCount: number;
  reactionCounts: Record<string, number>;
  myReactions: string[];
  isPinned?: boolean;
  commentsExpanded: boolean;
  onToggleReaction: (postId: string, emoji: string, e?: React.MouseEvent) => void;
  onToggleComments: (postId: string) => void;
};

export function HubPostActions({
  postId,
  commentCount,
  reactionCounts,
  myReactions,
  isPinned,
  commentsExpanded,
  onToggleReaction,
  onToggleComments,
}: Readonly<HubPostActionsProps>) {
  return (
    <div className={reactionButtonGroupClassName}>
      {/* Quick reaction buttons (first 3) */}
      {QUICK_REACTIONS.map((reaction) => {
        const { emoji, label } = reaction;
        const isActive = myReactions.includes(emoji);
        const reactionCount = reactionCounts[emoji] ?? 0;

        return (
          <Button
            key={emoji}
            type="button"
            variant={isActive ? "secondary" : "outline"}
            size="sm"
            onClick={(e) => onToggleReaction(postId, emoji, e)}
            className="rounded-full px-2.5"
            aria-label={`${isActive ? "Remover" : "Adicionar"} reação ${label} (${reactionCount})`}
          >
            <span className="text-sm leading-none">{emoji}</span>
            <NumberTicker value={reactionCount} className="text-xs text-current" />
          </Button>
        );
      })}

      {/* More reactions picker */}
      <ReactionPicker
        reactions={HUB_REACTIONS}
        myReactions={myReactions}
        onToggle={(emoji) => onToggleReaction(postId, emoji)}
        trigger={(open) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full px-1.5 text-[var(--text-muted)] hover:text-[var(--bg-paper)]"
            onClick={open}
            aria-label="Mais reações"
          >
            <span className="text-base">😊</span>
          </Button>
        )}
      />

      {/* Comments toggle */}
      <Button
        type="button"
        variant={commentsExpanded ? "secondary" : "outline"}
        size="sm"
        className="rounded-full px-3 text-[var(--bg-paper)] hover:text-white"
        onClick={() => onToggleComments(postId)}
      >
        <span className="text-xs font-medium">
          {commentsExpanded
            ? "✕ Fechar comentarios"
            : `💬 Ver comentarios (${commentCount})`}
        </span>
      </Button>

      {/* Pinned badge */}
      {isPinned ? <Badge variant="secondary">{feedCopy.post.pinned}</Badge> : null}
    </div>
  );
}
