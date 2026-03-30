"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { HubCommentDto } from "@/lib/api/types";
import { feedCopy } from "@/lib/canhoesCopy";

import { formatDateTime } from "./hubUtils";

const COMMENT_EMOJIS = ["\u2764\uFE0F", "\uD83D\uDD25", "\uD83D\uDE02"] as const;
const COMMENT_EMOJI_LABELS = ["\u2764\uFE0F", "\uD83D\uDD25", "\uD83D\uDE02"] as const;

export function CommentsSection({
  comments,
  draft,
  onDraftChange,
  onSubmit,
  onToggleReaction,
}: Readonly<{
  comments: HubCommentDto[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  onToggleReaction: (commentId: string, emoji: string) => void;
}>) {
  return (
    <section className="rounded-[var(--radius-lg-token)] border border-[var(--border-paper)] bg-[linear-gradient(180deg,rgba(247,240,227,0.9),rgba(233,221,198,0.82))] p-3 shadow-[var(--shadow-paper-soft)] sm:p-4">
      <div className="space-y-3">
        {(comments ?? []).length > 0 ? (
          (comments ?? []).map((comment) => (
            <article
              key={comment.id}
              className="canhoes-paper-panel rounded-[var(--radius-md-token)] px-3 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--text-dark)]">
                  {comment.userName}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatDateTime(comment.createdAtUtc)}
                </p>
              </div>

              <p className="body-small mt-2 whitespace-pre-wrap break-words text-[var(--text-dark)]/82">
                {comment.text}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {COMMENT_EMOJIS.map((emoji, emojiIndex) => {
                  const isActive = (comment.myReactions ?? []).includes(emoji);
                  const reactionCount = comment.reactionCounts?.[emoji] ?? 0;

                  return (
                    <Button
                      key={`${comment.id}-${emoji}`}
                      type="button"
                      variant={isActive ? "secondary" : "outline"}
                      size="sm"
                      className="rounded-full px-3"
                      onClick={() => onToggleReaction(comment.id, emoji)}
                    >
                      <span className="leading-none">
                        {COMMENT_EMOJI_LABELS[emojiIndex]}
                      </span>
                      <span className="text-xs tabular-nums">{reactionCount}</span>
                    </Button>
                  );
                })}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[var(--radius-md-token)] border border-dashed border-[rgba(107,76,42,0.2)] bg-[rgba(255,248,239,0.55)] px-4 py-6 text-center">
            <p className="body-small text-[var(--text-muted)]">
              {feedCopy.comments.empty}
            </p>
          </div>
        )}

        <div className="canhoes-paper-panel rounded-[var(--radius-md-token)] p-3">
          <div className="space-y-3">
            <label
              htmlFor="hub-comment-draft"
              className="editorial-kicker text-[var(--text-muted)]"
            >
              {feedCopy.comments.label}
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Textarea
                id="hub-comment-draft"
                value={draft}
                onChange={(event) => onDraftChange(event.target.value)}
                placeholder={feedCopy.comments.placeholder}
                className="min-h-[96px] flex-1 resize-none"
              />

              <Button
                type="button"
                className="w-full sm:w-auto sm:self-end"
                onClick={onSubmit}
                disabled={!draft.trim()}
              >
                {feedCopy.comments.submit}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
