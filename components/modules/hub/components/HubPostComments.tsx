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

import { formatDateTime, initials } from "./hubUtils";

const COMMENT_EMOJIS = ["❤️", "🔥", "😂"] as const;

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
      <section className="space-y-3 rounded-xl border border-stone-700/60 bg-stone-950/30 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-sm text-stone-100">
            <MessageSquare className="h-4 w-4 text-green-400" />
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
            className="h-8 rounded-full px-3 text-stone-100 hover:bg-stone-800 hover:text-white"
            onClick={() => onToggleComments(postId)}
          >
            ✕ Fechar comentarios
          </Button>
        </div>

        <div className="space-y-3">
          {sortedComments.length === 0 ? (
            <div className="rounded-xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm text-stone-700">
              {feedCopy.comments.empty}
            </div>
          ) : (
            sortedComments.map((comment) => {
              const isOwnComment =
                Boolean(currentUserId) && comment.userId === currentUserId;

              return (
                <article
                  key={comment.id}
                  className="rounded-xl border border-stone-300 bg-stone-100 p-3 text-stone-900 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="mt-0.5 h-9 w-9 border border-stone-300 bg-stone-200">
                      {comment.userName === currentUserName && currentUserImage ? (
                        <AvatarImage src={currentUserImage} alt={comment.userName} />
                      ) : null}
                      <AvatarFallback className="bg-stone-200 text-xs font-semibold text-stone-900">
                        {initials(comment.userName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-stone-900">
                              {comment.userName}
                            </p>
                            {comment.userName === postAuthorName ? (
                              <Badge
                                variant="outline"
                                className="border-stone-300 bg-stone-200 text-[10px] uppercase tracking-[0.12em] text-stone-700"
                              >
                                OP
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-stone-600">
                            {formatDateTime(comment.createdAtUtc)}
                          </p>
                        </div>

                        {isOwnComment ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-stone-700 hover:bg-stone-200 hover:text-stone-900"
                            onClick={() => setCommentPendingDelete(comment)}
                            aria-label="Apagar comentario"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-stone-900">
                        {comment.text}
                      </p>

                      <ReactionBar
                        emojis={COMMENT_EMOJIS}
                        reactionCounts={comment.reactionCounts ?? {}}
                        myReactions={comment.myReactions ?? []}
                        onToggle={(emoji) =>
                          onToggleCommentReaction(postId, comment.id, emoji)
                        }
                        className="mt-3"
                      />
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="rounded-xl border border-stone-300 bg-stone-100 p-3 text-stone-900 shadow-sm">
          <div className="flex items-start gap-3">
            <Avatar className="mt-0.5 h-9 w-9 border border-stone-300 bg-stone-200">
              {currentUserImage ? (
                <AvatarImage src={currentUserImage} alt={currentUserName} />
              ) : null}
              <AvatarFallback className="bg-stone-200 text-xs font-semibold text-stone-900">
                {initials(currentUserName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-3">
              <Textarea
                value={commentDraft}
                onChange={(event) => onCommentDraftChange(postId, event.target.value)}
                placeholder={feedCopy.comments.placeholder}
                className="min-h-[88px] resize-none border-stone-300 bg-stone-50 text-sm text-stone-900 placeholder:text-stone-600"
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-stone-300 bg-stone-50 text-stone-900 hover:bg-stone-200"
                  onClick={() => onCommentDraftChange(postId, "")}
                  disabled={!commentDraft}
                >
                  Limpar
                </Button>
                <Button
                  type="button"
                  className="bg-[#1a2e1a] text-stone-100 hover:bg-[#223822]"
                  onClick={() => onAddComment(postId)}
                  disabled={!commentDraft.trim()}
                >
                  {feedCopy.comments.submit}
                </Button>
              </div>
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
        <AlertDialogContent className="border-stone-300 bg-stone-100 text-stone-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-stone-900">
              Apagar comentario?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-stone-700">
              Este comentario vai desaparecer do feed para todos os membros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-stone-300 bg-stone-50 text-stone-900 hover:bg-stone-200">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#1a2e1a] text-stone-100 hover:bg-[#223822]"
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
