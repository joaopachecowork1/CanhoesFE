"use client";

import React from "react";
import { ChevronDown, ChevronUp, Reply } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReactionBar } from "@/components/ui/reaction-bar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const THREAD_EMOJIS = ["❤️", "🔥", "😂"] as const;

export interface CommentType {
  id: number | string;
  author: string;
  content: string;
  timestamp: string;
  avatarSrc?: string | null;
  reactionCounts?: Record<string, number>;
  myReactions?: string[];
  replies?: CommentType[];
  isOp?: boolean;
  persisted?: boolean;
}

export interface CommentNodeProps {
  comment: CommentType;
  depth: number;
  localReplies: Record<string, CommentType[]>;
  localReactionState: Record<
    string,
    { reactionCounts: Record<string, number>; myReactions: string[] }
  >;
  replyDrafts: Record<string, string>;
  expandedState: Record<string, boolean>;
  currentUserName: string;
  currentUserImage?: string | null;
  onDraftChange: (commentId: string, value: string) => void;
  onReply: (commentId: string) => void;
  onToggleReplies: (commentId: string) => void;
  onToggleReaction?: (commentId: string, emoji: string) => void;
  onToggleLocalReaction: (commentId: string, emoji: string) => void;
}

export function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function toggleReactionState(
  currentState: { reactionCounts: Record<string, number>; myReactions: string[] },
  emoji: string
) {
  const myReactions = new Set(currentState.myReactions);
  const isActive = myReactions.has(emoji);

  if (isActive) myReactions.delete(emoji);
  else myReactions.add(emoji);

  return {
    reactionCounts: {
      ...currentState.reactionCounts,
      [emoji]: Math.max(
        0,
        (currentState.reactionCounts[emoji] ?? 0) + (isActive ? -1 : 1)
      ),
    },
    myReactions: Array.from(myReactions),
  };
}

export function CommentNode({
  comment,
  depth,
  localReplies,
  localReactionState,
  replyDrafts,
  expandedState,
  currentUserName,
  currentUserImage,
  onDraftChange,
  onReply,
  onToggleReplies,
  onToggleReaction,
  onToggleLocalReaction,
}: Readonly<CommentNodeProps>) {
  const commentId = String(comment.id);
  const replies = [...(comment.replies ?? []), ...(localReplies[commentId] ?? [])];
  const hasReplies = replies.length > 0;
  const repliesExpanded = expandedState[commentId] ?? true;
  const showReplyBox = Boolean(replyDrafts[commentId]);
  const localReaction = localReactionState[commentId];
  const reactionCounts = localReaction?.reactionCounts ?? comment.reactionCounts ?? {};
  const myReactions = localReaction?.myReactions ?? comment.myReactions ?? [];

  return (
    <div
      className={cn(
        "space-y-2",
        depth > 0 && "ml-4 border-l border-[var(--border-subtle)] pl-3 sm:ml-5"
      )}
    >
      <article className="space-y-2">
        <div className="flex items-start gap-2.5">
          <Avatar className="mt-0.5 h-7 w-7 border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.06)]">
            {comment.avatarSrc ? (
              <AvatarImage src={comment.avatarSrc} alt={comment.author} />
            ) : null}
            <AvatarFallback className="bg-[rgba(255,255,255,0.08)] text-[10px] font-semibold text-[var(--text-primary)]">
              {getInitials(comment.author)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                {comment.author}
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                {comment.timestamp}
              </span>
              {comment.isOp ? (
                <Badge
                  variant="outline"
                  className="h-5 rounded-full border-[rgba(20,26,18,0.12)] px-1.5 text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
                >
                  OP
                </Badge>
              ) : null}
            </div>

            <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-5 text-[var(--text-primary)]">
              {comment.content}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              <ReactionBar
                emojis={THREAD_EMOJIS}
                reactionCounts={reactionCounts}
                myReactions={myReactions}
                onToggle={(emoji) =>
                  comment.persisted === false
                    ? onToggleLocalReaction(commentId, emoji)
                    : onToggleReaction?.(commentId, emoji)
                }
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 rounded-full px-2 text-[11px] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.08)]"
                onClick={() =>
                  onDraftChange(commentId, showReplyBox ? "" : `@${comment.author} `)
                }
              >
                <Reply className="mr-1 h-3 w-3" />
                Reply
              </Button>

              {hasReplies ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 rounded-full px-2 text-[11px] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.08)]"
                  onClick={() => onToggleReplies(commentId)}
                >
                  {repliesExpanded ? (
                    <ChevronUp className="mr-1 h-3 w-3" />
                  ) : (
                    <ChevronDown className="mr-1 h-3 w-3" />
                  )}
                  {repliesExpanded ? "Menos" : `${replies.length} respostas`}
                </Button>
              ) : null}
            </div>

            {showReplyBox ? (
              <div className="mt-2 flex gap-2 rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.04)] p-2.5">
                <Avatar className="mt-0.5 h-6 w-6 border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.06)]">
                  {currentUserImage ? (
                    <AvatarImage src={currentUserImage} alt={currentUserName} />
                  ) : null}
                  <AvatarFallback className="bg-[rgba(255,255,255,0.08)] text-[10px] font-semibold text-[var(--text-primary)]">
                    {getInitials(currentUserName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <Textarea
                    value={replyDrafts[commentId] ?? ""}
                    onChange={(event) => onDraftChange(commentId, event.target.value)}
                    placeholder={`Responder a ${comment.author}`}
                    className="min-h-[72px] resize-none border-[var(--border-subtle)] bg-[rgba(255,255,255,0.06)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => onDraftChange(commentId, "")}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8"
                      onClick={() => onReply(commentId)}
                      disabled={!replyDrafts[commentId]?.trim()}
                    >
                      Responder
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </article>

      {hasReplies && repliesExpanded ? (
        <div className="space-y-2">
          {replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              localReplies={localReplies}
              localReactionState={localReactionState}
              replyDrafts={replyDrafts}
              expandedState={expandedState}
              currentUserName={currentUserName}
              currentUserImage={currentUserImage}
              onDraftChange={onDraftChange}
              onReply={onReply}
              onToggleReplies={onToggleReplies}
              onToggleReaction={onToggleReaction}
              onToggleLocalReaction={onToggleLocalReaction}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
