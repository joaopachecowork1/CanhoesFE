"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, Reply } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface CommentThreadProps {
  initialComments: CommentType[];
  totalCount?: number;
  expanded?: boolean;
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

interface CommentNodeProps {
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

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function toggleReactionState(
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

function CommentNode({
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
        depth > 0 && "ml-4 border-l border-[rgba(20,26,18,0.12)] pl-3 sm:ml-5"
      )}
    >
      <article className="space-y-2">
        <div className="flex items-start gap-2.5">
          <Avatar className="mt-0.5 h-7 w-7 border border-[rgba(20,26,18,0.1)] bg-white/70">
            {comment.avatarSrc ? (
              <AvatarImage src={comment.avatarSrc} alt={comment.author} />
            ) : null}
            <AvatarFallback className="bg-white/80 text-[10px] font-semibold text-[var(--text-dark)]">
              {getInitials(comment.author)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[13px] font-semibold text-[var(--text-dark)]">
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

            <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-5 text-[var(--text-ink)]">
              {comment.content}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              {THREAD_EMOJIS.map((emoji) => {
                const isActive = myReactions.includes(emoji);
                const count = reactionCounts[emoji] ?? 0;

                return (
                  <Button
                    key={`${commentId}-${emoji}`}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-6 rounded-full border border-[rgba(20,26,18,0.1)] bg-white/65 px-2 text-[11px] text-[var(--text-dark)] hover:bg-white",
                      isActive && "border-[rgba(80,98,59,0.28)] bg-[rgba(110,140,78,0.14)]"
                    )}
                    onClick={() =>
                      comment.persisted === false
                        ? onToggleLocalReaction(commentId, emoji)
                        : onToggleReaction?.(commentId, emoji)
                    }
                  >
                    <span>{emoji}</span>
                    <span className="tabular-nums">{count}</span>
                  </Button>
                );
              })}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 rounded-full px-2 text-[11px] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.7)]"
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
                  className="h-6 rounded-full px-2 text-[11px] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.7)]"
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
              <div className="mt-2 flex gap-2 rounded-2xl border border-[rgba(20,26,18,0.1)] bg-white/65 p-2.5">
                <Avatar className="mt-0.5 h-6 w-6 border border-[rgba(20,26,18,0.1)] bg-white/70">
                  {currentUserImage ? (
                    <AvatarImage src={currentUserImage} alt={currentUserName} />
                  ) : null}
                  <AvatarFallback className="bg-white/80 text-[10px] font-semibold text-[var(--text-dark)]">
                    {getInitials(currentUserName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <Textarea
                    value={replyDrafts[commentId] ?? ""}
                    onChange={(event) => onDraftChange(commentId, event.target.value)}
                    placeholder={`Responder a ${comment.author}`}
                    className="min-h-[72px] resize-none border-[rgba(20,26,18,0.1)] bg-white text-sm"
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

export function CommentThread({
  initialComments,
  totalCount,
  expanded = false,
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
  const visibleComments = expanded ? threadComments : threadComments.slice(0, 1);
  const hiddenCount = Math.max(totalComments - visibleComments.length, 0);
  const showExpandButton = totalComments > 1;

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
    <section className="space-y-3 rounded-[28px] border border-[rgba(20,26,18,0.1)] bg-[rgba(255,255,255,0.56)] p-3 backdrop-blur-[10px]">
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
            className="h-8 rounded-full px-2 text-xs font-medium text-[var(--text-muted)] hover:bg-white/70"
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

      <div className="rounded-2xl border border-[rgba(20,26,18,0.1)] bg-white/72 p-2.5">
        <div className="flex items-start gap-2.5">
          <Avatar className="mt-0.5 h-7 w-7 border border-[rgba(20,26,18,0.1)] bg-white/70">
            {currentUserImage ? (
              <AvatarImage src={currentUserImage} alt={currentUserName} />
            ) : null}
            <AvatarFallback className="bg-white/80 text-[10px] font-semibold text-[var(--text-dark)]">
              {getInitials(currentUserName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <Textarea
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder={composerPlaceholder}
              className="min-h-[76px] resize-none border-[rgba(20,26,18,0.1)] bg-white text-sm"
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
    </section>
  );
}
