"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { HubCommentDto } from "@/lib/api/types";

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
    <section className="rounded-[var(--radius-lg-token)] border border-[var(--border-paper)] bg-[var(--bg-paper-alt)]/82 p-3 sm:p-4">
      <div className="space-y-3">
        {(comments ?? []).length > 0 ? (
          (comments ?? []).map((comment) => (
            <article
              key={comment.id}
              className="rounded-[var(--radius-md-token)] border border-[var(--border-paper)] bg-[var(--bg-paper)] px-3 py-3 shadow-[var(--shadow-paper)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--text-dark)]">
                  {comment.userName}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatDateTime(comment.createdAtUtc)}
                </p>
              </div>

              <p className="body-small mt-2 whitespace-pre-wrap break-words text-[var(--color-text-secondary)]">
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
          <div className="rounded-[var(--radius-md-token)] border border-dashed border-[var(--border-paper)] px-4 py-6 text-center">
            <p className="body-small text-[var(--text-muted)]">
              Ainda nao ha comentarios neste post.
            </p>
          </div>
        )}

        <div className="rounded-[var(--radius-md-token)] border border-[var(--border-paper)] bg-[var(--bg-paper)] p-3">
          <div className="space-y-3">
            <label
              htmlFor="hub-comment-draft"
              className="editorial-kicker text-[var(--text-muted)]"
            >
              Responder
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Textarea
                id="hub-comment-draft"
                value={draft}
                onChange={(event) => onDraftChange(event.target.value)}
                placeholder="Escreve um comentario..."
                className="min-h-[96px] flex-1 resize-none bg-[var(--bg-paper-alt)]"
              />

              <Button
                type="button"
                className="w-full sm:w-auto sm:self-end"
                onClick={onSubmit}
                disabled={!draft.trim()}
              >
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
