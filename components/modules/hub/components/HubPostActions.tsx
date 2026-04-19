"use client";

import { memo } from "react";

import { NumberTicker } from "@/components/animations/NumberTicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { feedCopy } from "@/lib/canhoesCopy";
import { HUB_REACTIONS, QUICK_REACTIONS } from "@/lib/reactions";
import { ReactionPicker } from "./ReactionPicker";

const reactionButtonGroupClassName =
  "flex flex-wrap items-center gap-1.5 [&>button]:h-9 [&>button]:rounded-full [&>button]:border-[var(--border-subtle)] [&>button]:bg-[var(--bg-surface)] [&>button]:px-2.5 [&>button]:text-[var(--text-primary)] [&>button]:shadow-sm [&>button:hover]:bg-[var(--bg-deep)]";

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

function HubPostActionsComponent({
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

      <ReactionPicker
        reactions={HUB_REACTIONS}
        myReactions={myReactions}
        onToggle={(emoji) => onToggleReaction(postId, emoji)}
        trigger={(open) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-full px-3 text-[var(--text-primary)]"
            onClick={open}
            aria-label="Mais reações"
          >
            <span className="text-sm">😊</span>
            <span className="text-xs font-medium">Reagir</span>
          </Button>
        )}
      />

      <Button
        type="button"
        variant={commentsExpanded ? "secondary" : "outline"}
        size="sm"
        className="h-9 rounded-full px-3 text-[var(--text-primary)]"
        onClick={() => onToggleComments(postId)}
      >
        <span className="text-xs font-medium">
          {commentsExpanded ? "Fechar comentários" : `Comentários (${commentCount})`}
        </span>
      </Button>

      {isPinned ? <Badge variant="secondary">{feedCopy.post.pinned}</Badge> : null}
    </div>
  );
}

export const HubPostActions = memo(HubPostActionsComponent);
HubPostActions.displayName = "HubPostActions";
