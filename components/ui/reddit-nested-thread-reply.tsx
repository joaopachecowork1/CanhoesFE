"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  CommentNode,
  type CommentType,
  getInitials,
  toggleReactionState,
} from "@/components/ui/comment-thread-node";

interface CommentThreadProps {
  initialComments: CommentType[];
  totalCount?: number;
  previewCommentCount?: number;
  expanded?: boolean;
  showComposer?: boolean;
  onToggleExpanded?: () => void;
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  onToggleReaction?: (commentId: string, emoji: string) => void;
  currentUserName?: string;
  currentUserImage?: string | null;
  composerPlaceholder?: string;
  composerSubmitLabel?: string;
  emptyStateLabel?: string;
}

export function CommentThread({
  initialComments,
  totalCount,
  previewCommentCount = 2,
  expanded = false,
  showComposer = true,
  onToggleExpanded,
  draft,
  onDraftChange,
  onSubmit,
  onToggleReaction,
  currentUserName = "Tu",
  currentUserImage,
  composerPlaceholder = "Escreve uma resposta...",
  composerSubmitLabel = "Comentar",
  emptyStateLabel = "Ainda nao ha comentarios.",
}: Readonly<CommentThreadProps>) {
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [localReplies, setLocalReplies] = useState<Record<string, CommentType[]>>({});
  const [localReactionState, setLocalReactionState] = useState<
    Record<string, { reactionCounts: Record<string, number>; myReactions: string[] }>
  >({});
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>({});

  const threadComments = useMemo(() => initialComments ?? [], [initialComments]);
  const totalComments = Math.max(totalCount ?? 0, threadComments.length);
  const visibleComments = expanded
    ? threadComments
    : threadComments.slice(0, Math.max(1, previewCommentCount));
  const hiddenCount = Math.max(totalComments - visibleComments.length, 0);
  const showExpandButton = totalComments > Math.max(1, previewCommentCount);

  const handleReplyDraftChange = (commentId: string, value: string) => {
    setReplyDrafts((currentDrafts) => ({ ...currentDrafts, [commentId]: value }));
  };

  const handleReply = (parentId: string) => {
    const content = replyDrafts[parentId]?.trim();
    if (!content) return;

    const newReply: CommentType = {
      id: `local-${parentId}-${Date.now()}`,
      author: currentUserName,
      avatarSrc: currentUserImage,
      content,
      timestamp: "Agora",
      reactionCounts: {},
      myReactions: [],
      replies: [],
      persisted: false,
    };

    // Nested replies stay client-side until the API exposes parent/child relations.
    setLocalReplies((currentReplies) => ({
      ...currentReplies,
      [parentId]: [...(currentReplies[parentId] ?? []), newReply],
    }));
    setReplyDrafts((currentDrafts) => ({ ...currentDrafts, [parentId]: "" }));
    setExpandedState((currentState) => ({ ...currentState, [parentId]: true }));
  };

  const handleToggleReplies = (commentId: string) => {
    setExpandedState((currentState) => ({
      ...currentState,
      [commentId]: !(currentState[commentId] ?? true),
    }));
  };

  const handleToggleLocalReaction = (commentId: string, emoji: string) => {
    setLocalReactionState((currentState) => {
      const baseState = currentState[commentId] ?? {
        reactionCounts: {},
        myReactions: [],
      };

      return {
        ...currentState,
        [commentId]: toggleReactionState(baseState, emoji),
      };
    });
  };

  return (
    <section className="space-y-3 rounded-[20px] border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.04)] p-3 backdrop-blur-[6px]">
      <div className="space-y-2">
        {totalComments === 0 ? (
          <p className="px-1 text-xs text-[var(--text-muted)]">{emptyStateLabel}</p>
        ) : threadComments.length === 0 ? (
          <p className="px-1 text-xs text-[var(--text-muted)]">
            A carregar comentarios...
          </p>
        ) : (
          <div className="space-y-2">
            {visibleComments.map((comment) => (
              <CommentNode
                key={comment.id}
                comment={comment}
                depth={0}
                localReplies={localReplies}
                localReactionState={localReactionState}
                replyDrafts={replyDrafts}
                expandedState={expandedState}
                currentUserName={currentUserName}
                currentUserImage={currentUserImage}
                onDraftChange={handleReplyDraftChange}
                onReply={handleReply}
                onToggleReplies={handleToggleReplies}
                onToggleReaction={onToggleReaction}
                onToggleLocalReaction={handleToggleLocalReaction}
              />
            ))}
          </div>
        )}

        {showExpandButton ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-full px-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.08)]"
            onClick={onToggleExpanded}
          >
            {expanded ? (
              <ChevronUp className="mr-1 h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="mr-1 h-3.5 w-3.5" />
            )}
            {expanded
              ? "Mostrar menos comentarios"
              : `Ver mais ${hiddenCount} comentarios`}
          </Button>
        ) : null}
      </div>

      {showComposer ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.04)] p-2.5">
          <div className="flex items-start gap-2.5">
            <Avatar className="mt-0.5 h-7 w-7 border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.06)]">
              {currentUserImage ? (
                <AvatarImage src={currentUserImage} alt={currentUserName} />
              ) : null}
              <AvatarFallback className="bg-[rgba(255,255,255,0.08)] text-[10px] font-semibold text-[var(--text-primary)]">
                {getInitials(currentUserName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-2">
              <Textarea
                value={draft}
                onChange={(event) => onDraftChange(event.target.value)}
                placeholder={composerPlaceholder}
                className="min-h-[76px] resize-none border-[var(--border-subtle)] bg-[rgba(255,255,255,0.06)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() => onDraftChange("")}
                  disabled={!draft}
                >
                  Limpar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-8"
                  onClick={onSubmit}
                  disabled={!draft.trim()}
                >
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                  {composerSubmitLabel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
