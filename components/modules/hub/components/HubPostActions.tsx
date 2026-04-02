"use client";

import { MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/animations/NumberTicker";
import { feedCopy } from "@/lib/canhoesCopy";

const HUB_EMOJIS = ["❤️", "🔥", "😂"] as const;
const HUB_EMOJI_LABELS = ["❤️", "🔥", "😂"] as const;

const reactionButtonGroupClassName =
  "flex flex-wrap gap-1.5 [&>button]:border-[rgba(74,92,47,0.28)] [&>button]:bg-[rgba(255,255,255,0.06)] [&>button]:text-[var(--text-primary)] [&>button:hover]:bg-[rgba(255,255,255,0.12)]";

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
        <span className="text-xs">{commentCount}</span>
      </Button>

      {isPinned ? <Badge variant="secondary">{feedCopy.post.pinned}</Badge> : null}
    </div>
  );
}
