"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowBigUp, MessageSquare } from "lucide-react";

import { BlurFade } from "@/components/animations/BlurFade";
import type { EventFeedPostFullDto } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { parsePostText } from "@/lib/postUtils";

import { PostHeader } from "./components/PostHeader";
import { ImageLightbox } from "./components/ImageLightbox";
import { HEART_REACTION } from "@/lib/reactions";

const LazyHubPostComments = dynamic(
  () => import("./components/HubPostComments").then((module) => ({ default: module.HubPostComments })),
  {
    loading: () => null,
    ssr: false,
  }
);

const LazyMediaCarousel = dynamic(
  () => import("./components/MediaCarousel").then((module) => ({ default: module.MediaCarousel })),
  {
    loading: () => <FeedMediaFallback />,
    ssr: false,
  }
);

const LazyPollBox = dynamic(
  () => import("./components/PollBox").then((module) => ({ default: module.PollBox })),
  {
    loading: () => <FeedPollFallback />,
    ssr: false,
  }
);

interface HubPostCardProps {
  post: EventFeedPostFullDto;
  index: number;
  eventId: string;
  isAdmin: boolean;
  openComments: boolean;
  commentDraft: string;
  currentUserId?: string | null;
  currentUserName: string;
  currentUserImage?: string | null;
  onToggleReaction: (postId: string, emoji: string) => void;
  onToggleDownvote: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onAddComment: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onCommentDraftChange: (postId: string, text: string) => void;
  onAdminPin: (postId: string) => void;
  onAdminDelete: (postId: string) => void;
}

function HubPostCardComponent({
  post,
  index,
  eventId,
  isAdmin,
  openComments,
  commentDraft,
  currentUserId,
  currentUserName,
  currentUserImage,
  onToggleReaction,
  onToggleDownvote,
  onToggleComments,
  onVotePoll,
  onAddComment,
  onDeleteComment,
  onCommentDraftChange,
  onAdminPin,
  onAdminDelete,
}: Readonly<HubPostCardProps>) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openComments && commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [openComments]);

  const resolvedMediaUrls = [...new Set([...(post.mediaUrls ?? []), post.mediaUrl].filter(Boolean))] as string[];

  const hasMedia = resolvedMediaUrls.length > 0;
  const parsedText = post.text?.trim() ? parsePostText(post.text) : null;
  const displayScore = (post.likeCount ?? 0) - (post.downvoteCount ?? 0);
  const commentCount = post.commentCount ?? 0;

  const handleImageClick = (imageIndex: number) => {
    setLightboxIndex(imageIndex);
    setLightboxOpen(true);
  };

  const handleUpvote = useCallback(() => {
    onToggleReaction(post.id, HEART_REACTION);
  }, [post.id, onToggleReaction]);

  const handleDownvote = useCallback(() => {
    onToggleDownvote(post.id);
  }, [post.id, onToggleDownvote]);

  return (
    <BlurFade delay={index * 50}>
      <article className="canhoes-paper-panel overflow-hidden rounded-[var(--radius-md-token)] border-[var(--border-paper)]">

        <div className="flex flex-col sm:flex-row">
          {/* ── Sidebar: upvote / score / downvote / comments ── */}
          <div className="flex flex-row items-center justify-between gap-2 border-b border-[var(--border-paper-soft)] bg-white/[0.02] px-3 py-2 sm:min-w-[56px] sm:flex-col sm:justify-start sm:gap-0.5 sm:border-b-0 sm:border-r sm:px-2 sm:py-3">
            <div className="flex items-center gap-1.5 sm:flex-col sm:gap-0.5 min-h-[44px] min-w-[44px] items-center justify-center">
              <button
                type="button"
                onClick={handleUpvote}
                className={cn(
                  "canhoes-tap min-h-11 min-w-11 rounded border p-1 transition-colors",
                  post.likedByMe
                    ? "border-[rgba(79,99,54,0.4)] bg-[rgba(79,99,54,0.18)] text-[var(--moss)] shadow-[0_0_0_1px_rgba(79,99,54,0.25)]"
                    : "border-transparent text-[var(--ink-muted)] hover:border-[rgba(79,99,54,0.2)] hover:bg-[rgba(79,99,54,0.08)] hover:text-[var(--moss)]"
                )}
                aria-label={post.likedByMe ? "Remover upvote" : "Upvote"}
              >
                <ArrowBigUp className="h-5 w-5" />
              </button>

              <span
                className={cn(
                  "min-w-[2.25rem] text-center font-mono text-xs font-bold tabular-nums sm:min-w-0",
                  post.likedByMe
                    ? "text-[var(--moss)]"
                    : post.downvotedByMe
                      ? "text-[var(--neon-red)]"
                      : "text-zinc-300"
                )}
              >
                {displayScore}
              </span>

              <button
                type="button"
                onClick={handleDownvote}
                className={cn(
                  "canhoes-tap min-h-11 min-w-11 rounded border p-1 transition-colors",
                  post.downvotedByMe
                    ? "border-[rgba(255,58,58,0.35)] bg-[rgba(255,58,58,0.14)] text-[var(--neon-red)] shadow-[0_0_0_1px_rgba(255,58,58,0.25)]"
                    : "border-transparent text-[var(--ink-muted)] hover:border-[rgba(255,58,58,0.22)] hover:bg-[rgba(255,58,58,0.08)] hover:text-[var(--neon-red)]"
                )}
                aria-label={post.downvotedByMe ? "Remover downvote" : "Downvote"}
              >
                <ArrowBigUp className="h-5 w-5 rotate-180" />
              </button>
            </div>

            <button
              type="button"
              className="canhoes-tap flex items-center gap-1.5 rounded px-1 py-1 text-[var(--ink-muted)] transition-colors hover:text-[var(--moss)] sm:mt-2 sm:flex-col sm:gap-0.5 sm:px-0.5"
              onClick={() => onToggleComments(post.id)}
              aria-label={`${commentCount} comentários`}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-[10px] font-medium tabular-nums">{commentCount}</span>
            </button>
          </div>

          {/* ── Main content ── */}
          <div className="min-w-0 flex-1">
            <div className="space-y-2 px-3 pt-3 sm:px-4 sm:pt-2.5">
              <PostHeader
                authorName={post.authorName}
                createdAtUtc={post.createdAtUtc}
                isPinned={post.isPinned}
                isAdmin={isAdmin}
                onAdminPin={() => onAdminPin(post.id)}
                onAdminDelete={() => onAdminDelete(post.id)}
              />

              {parsedText ? (
                parsedText.title ? (
                  <div className="space-y-1.5">
                    <p className="post-title text-zinc-100">{parsedText.title}</p>
                    {parsedText.body ? (
                      <p className="post-body whitespace-pre-wrap break-words text-zinc-300">
                        {parsedText.body}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="body-base whitespace-pre-wrap break-words text-zinc-200 leading-[1.6]">
                    {post.text}
                  </p>
                )
              ) : null}

              {hasMedia ? (
                <LazyMediaCarousel
                  urls={resolvedMediaUrls}
                  aspect="video"
                  onImageClick={handleImageClick}
                  authorName={post.authorName}
                  isPriority={index < 2}
                />
              ) : null}
            </div>

            {post.poll ? (
              <div className="px-3 pb-2 pt-1 sm:px-4">
                <LazyPollBox
                  poll={post.poll}
                  onVote={(optionId) => onVotePoll(post.id, optionId)}
                />
              </div>
            ) : null}

            {/* ── Comments section ── */}
            <div className="px-3 pb-3 pt-1 sm:px-4 sm:pb-2.5">
              {/* Comment toggle button */}
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  openComments
                    ? "bg-[rgba(79,99,54,0.12)] text-[var(--moss)]"
                    : "text-[var(--ink-muted)] hover:bg-white/[0.04] hover:text-[var(--ink-primary)]"
                )}
                onClick={() => onToggleComments(post.id)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {openComments ? "Fechar comentários" : `Comentários (${commentCount})`}
              </button>

              <div
                ref={commentsRef}
                className={`mt-2 grid transition-all duration-200 ease-out ${
                  openComments ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <LazyHubPostComments
                    postId={post.id}
                    postAuthorName={post.authorName}
                    eventId={eventId}
                    commentCount={commentCount}
                    openComments={openComments}
                    commentDraft={commentDraft}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    currentUserImage={currentUserImage}
                    onToggleComments={onToggleComments}
                    onAddComment={onAddComment}
                    onDeleteComment={onDeleteComment}
                    onCommentDraftChange={onCommentDraftChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ImageLightbox
          images={resolvedMediaUrls}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          authorName={post.authorName}
          createdAtUtc={post.createdAtUtc}
        />
      </article>
    </BlurFade>
  );
}

function FeedMediaFallback() {
  return <div className="skeleton-shimmer h-64 w-full rounded-[var(--radius-md-token)]" />;
}

function FeedPollFallback() {
  return <div className="skeleton-shimmer h-32 w-full rounded-[var(--radius-md-token)]" />;
}

export const HubPostCard = memo(HubPostCardComponent);
HubPostCard.displayName = "HubPostCard";
