"use client";

import { MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/animations/NumberTicker";
import { feedCopy } from "@/lib/canhoesCopy";

import { HUB_EMOJIS } from "./ReactionRail";

const HUB_EMOJI_LABELS = ["❤️", "🔥", "😂"] as const;

const reactionButtonGroupClassName =
  "flex flex-wrap gap-1.5 [&>button]:border-[rgba(107,76,42,0.18)] [&>button]:bg-[rgba(255,255,255,0.35)] [&>button]:text-[var(--text-ink)] [&>button:hover]:bg-[rgba(255,255,255,0.55)]";
const statBadgeClassName =
  "canhoes-paper-card rounded-full px-2.5 py-1 text-[var(--text-dark)] shadow-none";

type HubPostActionsProps = {
  postId: string;
  commentCount: number;
  reactionCountTotal: number;
  reactionCounts: Record<string, number>;
  myReactions: string[];
  likeCount: number;
  isPinned?: boolean;
  commentsExpanded: boolean;
  onToggleReaction: (postId: string, emoji: string) => void;
  onToggleComments: (postId: string) => void;
  onOpenCommentComposer: () => void;
};

export function HubPostActions({
  postId,
  commentCount,
  reactionCountTotal,
  reactionCounts,
  myReactions,
  likeCount,
  isPinned,
  commentsExpanded,
  onToggleReaction,
  onToggleComments,
  onOpenCommentComposer,
}: Readonly<HubPostActionsProps>) {
  return (
    <div className="space-y-3">
      <div className={reactionButtonGroupClassName}>
        {HUB_EMOJIS.map((emoji, emojiIndex) => {
          const isActive = myReactions.includes(emoji);
          const reactionCount =
            reactionCounts[emoji] ?? (emojiIndex === 0 ? likeCount : 0);

          return (
            <Button
              key={emoji}
              type="button"
              variant={isActive ? "secondary" : "outline"}
              size="sm"
              onClick={() => onToggleReaction(postId, emoji)}
              className="rounded-full px-2.5"
            >
              <span className="text-sm leading-none">
                {HUB_EMOJI_LABELS[emojiIndex]}
              </span>
              <NumberTicker value={reactionCount} className="text-xs" />
            </Button>
          );
        })}

        <Button
          type="button"
          variant={commentsExpanded ? "secondary" : "outline"}
          size="sm"
          className="rounded-full px-2.5"
          onClick={() => {
            onOpenCommentComposer();
            if (!commentsExpanded) onToggleComments(postId);
          }}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {feedCopy.comments.label}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
        <span className={statBadgeClassName}>
          {commentCount} {feedCopy.post.commentCount}
        </span>
        <span className={statBadgeClassName}>
          {reactionCountTotal} {feedCopy.post.reactionCount}
        </span>
        {isPinned ? <Badge variant="secondary">{feedCopy.post.pinned}</Badge> : null}
      </div>
    </div>
  );
}
