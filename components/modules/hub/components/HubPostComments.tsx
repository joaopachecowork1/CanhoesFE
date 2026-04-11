"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReactionBar } from "@/components/ui/reaction-bar";
import { Textarea } from "@/components/ui/textarea";
import type { HubCommentDto } from "@/lib/api/types";
import { feedCopy } from "@/lib/canhoesCopy";
import { HUB_EMOJI_STRINGS } from "@/lib/reactions";

import { formatDateTime, initials } from "./hubUtils";

type HubPostCommentsProps = {
  postId: string;
  postAuthorName: string;
  comments: HubCommentDto[];
  commentCount: number;
  openComments: boolean;
  commentDraft: string;
  currentUserId?: string | null;
  currentUserName: string;
  currentUserImage?: string | null;
  onToggleComments: (postId: string) => void;
  onAddComment: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onCommentDraftChange: (postId: string, text: string) => void;
  onToggleCommentReaction: (
    postId: string,
    commentId: string,
    emoji: string
  ) => void;
};

export function HubPostComments({
  postId,
  postAuthorName,
  comments,
  commentCount,
  openComments,
  commentDraft,
  currentUserId,
  currentUserName,
  currentUserImage,
  onToggleComments,
  onAddComment,
  onDeleteComment,
  onCommentDraftChange,
  onToggleCommentReaction,
}: Readonly<HubPostCommentsProps>) {
  const [commentPendingDelete, setCommentPendingDelete] = useState<HubCommentDto | null>(null);

  const sortedComments = useMemo(
    () =>
      [...comments].sort((left, right) =>
        String(left.createdAtUtc).localeCompare(String(right.createdAtUtc))
      ),
    [comments]
  );

  if (!openComments) return null;

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            <MessageSquare className="h-4 w-4 text-[var(--moss-glow)]" />
            <span className="font-medium">
              {commentCount > 0
                ? `${commentCount} comentario${commentCount === 1 ? "" : "s"}`
                : "Sem comentarios ainda"}
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-full px-3 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
            onClick={() => onToggleComments(postId)}
          >
            ✕ Fechar
          </Button>
        </div>

        {/* Comment list — Reddit-style threaded */}
        <div className="space-y-0">
          {sortedComments.length === 0 ? (
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-deep)] px-4 py-3 text-sm text-[var(--text-muted)]">
              {feedCopy.comments.empty}
            </div>
          ) : (
            sortedComments.map((comment, commentIndex) => {
              const isOwnComment =
                Boolean(currentUserId) && comment.userId === currentUserId;

              return (
                <article
                  key={comment.id}
                  className="comment-thread group flex gap-3 border-l-2 border-[var(--border-subtle)] px-3 py-2.5 transition-colors hover:border-[var(--moss-glow)]/50"
                  style={{ marginLeft: commentIndex > 0 ? "0.5rem" : 0 }}
                >
                  <Avatar className="mt-0.5 h-7 w-7 shrink-0 bg-[var(--bg-surface)]">
                    {comment.userName === currentUserName && currentUserImage ? (
                      <AvatarImage src={currentUserImage} alt={comment.userName} />
                    ) : null}
                    <AvatarFallback className="bg-[var(--bg-surface)] text-[10px] font-semibold text-[var(--text-muted)]">
                      {initials(comment.userName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {comment.userName}
                      </span>
                      {comment.userName === postAuthorName && (
                        <Badge
                          variant="outline"
                          className="h-4 min-w-4 border-[var(--border-moss)] bg-[rgba(122,173,58,0.1)] text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--moss-glow)]"
                        >
                          OP
                        </Badge>
                      )}
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {formatDateTime(comment.createdAtUtc)}
                      </span>
                    </div>

                    <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--text-primary)]">
                      {comment.text}
                    </p>

                    <ReactionBar
                      emojis={HUB_EMOJI_STRINGS}
                      reactionCounts={comment.reactionCounts ?? {}}
                      myReactions={comment.myReactions ?? []}
                      onToggle={(emoji) =>
                        onToggleCommentReaction(postId, comment.id, emoji)
                      }
                      className="mt-2"
                    />

                    {isOwnComment && (
                      <div className="mt-1 flex justify-end">
                        <button
                          type="button"
                          className="canhoes-tap flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] transition-colors hover:text-[var(--danger)]"
                          onClick={() => setCommentPendingDelete(comment)}
                          aria-label="Apagar comentario"
                        >
                          <Trash2 className="h-3 w-3" />
                          Apagar
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Comment form */}
        <div className="flex gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-deep)] p-3">
          <Avatar className="mt-0.5 h-7 w-7 shrink-0 bg-[var(--bg-surface)]">
            {currentUserImage ? (
              <AvatarImage src={currentUserImage} alt={currentUserName} />
            ) : null}
            <AvatarFallback className="bg-[var(--bg-surface)] text-[10px] font-semibold text-[var(--text-muted)]">
              {initials(currentUserName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <Textarea
              value={commentDraft}
              onChange={(event) => onCommentDraftChange(postId, event.target.value)}
              placeholder={feedCopy.comments.placeholder}
              className="min-h-[64px] resize-none border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-deep)]"
                onClick={() => onCommentDraftChange(postId, "")}
                disabled={!commentDraft}
              >
                Limpar
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-[var(--moss)] text-white hover:bg-[var(--moss-light)]"
                onClick={() => onAddComment(postId)}
                disabled={!commentDraft.trim()}
              >
                {feedCopy.comments.submit}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <AlertDialog
        open={Boolean(commentPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setCommentPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              Este comentario vai desaparecer do feed para todos os membros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-deep)]"
              onClick={() => setCommentPendingDelete(null)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--moss)] text-white hover:bg-[var(--moss-light)]"
              onClick={() => {
                if (!commentPendingDelete) return;
                onDeleteComment(postId, commentPendingDelete.id);
                setCommentPendingDelete(null);
              }}
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
