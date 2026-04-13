"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ArrowBigUp, MessageSquare } from "lucide-react";

import { BlurFade } from "@/components/animations/BlurFade";
import { CanhoesDecorativeDivider, CanhoesGlowBackdrop } from "@/components/ui/canhoes-bits";
import type { EventFeedPostFullDto, HubCommentDto } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { parsePostText } from "@/lib/postUtils";

import { HubPostActions } from "./components/HubPostActions";
import { PostHeader } from "./components/PostHeader";
import { ImageLightbox } from "./components/ImageLightbox";
import { EmojiBurstContainer, useEmojiBurst } from "./components/EmojiBurst";
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
  isAdmin: boolean;
  openComments: boolean;
  commentDraft: string;
  comments?: HubCommentDto[];
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
  onToggleCommentReaction: (
    postId: string,
    commentId: string,
    emoji: string
  ) => void;
  onAdminPin: (postId: string) => void;
  onAdminDelete: (postId: string) => void;
}

function HubPostCardComponent({
  post,
  index,
  isAdmin,
  openComments,
  commentDraft,
  comments = [],
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
  onToggleCommentReaction,
  onAdminPin,
  onAdminDelete,
}: Readonly<HubPostCardProps>) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { bursts, trigger: triggerBurst, clear: clearBursts } = useEmojiBurst();
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openComments && commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [openComments]);

  const mediaUrls = useCallback(
    () =>
      Array.from(
        new Set(
          [...(post.mediaUrls ?? []), post.mediaUrl].filter(
            (value): value is string => Boolean(value)
          )
        )
      ),
    [post.mediaUrls, post.mediaUrl]
  );

  const resolvedMediaUrls = mediaUrls();
  const reactionCounts = post.reactionCounts || {};

  const hasMedia = resolvedMediaUrls.length > 0;
  const hasText = !!post.text?.trim();
  const displayScore = (post.likeCount ?? 0) - (post.downvoteCount ?? 0);
  const commentCount = post.commentCount ?? 0;

  const handleImageClick = (imageIndex: number) => {
    setLightboxIndex(imageIndex);
    setLightboxOpen(true);
  };

  const handleReaction = useCallback(
    (postId: string, emoji: string, e?: React.MouseEvent) => {
      onToggleReaction(postId, emoji);
      if (e) {
        const rect = e.currentTarget.getBoundingClientRect();
        triggerBurst(emoji, rect.left + rect.width / 2, rect.top);
      }
    },
    [onToggleReaction, triggerBurst]
  );

  const handleUpvote = useCallback(() => {
    onToggleReaction(post.id, HEART_REACTION);
  }, [post.id, onToggleReaction]);

  const handleDownvote = useCallback(() => {
    onToggleDownvote(post.id);
  }, [post.id, onToggleDownvote]);

  return (
    <BlurFade delay={index * 50}>
      <article className="reddit-post canhoes-bits-panel canhoes-bits-panel--social overflow-hidden rounded-[var(--radius-md-token)]">
        <CanhoesGlowBackdrop tone="social" />

        <div className="flex flex-col sm:flex-row">
          <div className="reddit-vote-sidebar flex flex-row items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-void)] px-3 py-2 sm:min-w-[56px] sm:flex-col sm:justify-start sm:gap-0.5 sm:border-b-0 sm:border-r sm:px-2 sm:py-3">
            <div className="flex items-center gap-1.5 sm:flex-col sm:gap-0.5">
              <button
                type="button"
                onClick={handleUpvote}
                className={cn(
                  "canhoes-tap rounded p-1 transition-colors",
                  post.likedByMe
                    ? "text-[var(--neon-green)]"
                    : "text-[var(--text-muted)] hover:text-[var(--neon-green)]"
                )}
                aria-label={post.likedByMe ? "Remover upvote" : "Upvote"}
              >
                <ArrowBigUp className="h-5 w-5" />
              </button>

              <span
                className={cn(
                  "reddit-score min-w-[2.25rem] text-center font-mono text-xs font-bold tabular-nums sm:min-w-0",
                  post.likedByMe
                    ? "text-[var(--neon-green)]"
                    : post.downvotedByMe
                      ? "text-[var(--neon-red)]"
                      : "text-[var(--text-primary)]"
                )}
              >
                {displayScore}
              </span>

              <button
                type="button"
                onClick={handleDownvote}
                className={cn(
                  "canhoes-tap rounded p-1 transition-colors",
                  post.downvotedByMe
                    ? "text-[var(--neon-red)]"
                    : "text-[var(--text-muted)] hover:text-[var(--neon-red)]"
                )}
                aria-label={post.downvotedByMe ? "Remover downvote" : "Downvote"}
              >
                <ArrowBigUp className="h-5 w-5 rotate-180" />
              </button>
            </div>

            <button
              type="button"
              className="canhoes-tap flex items-center gap-1.5 rounded px-1 py-1 text-[var(--text-muted)] transition-colors hover:text-[var(--moss-glow)] sm:mt-2 sm:flex-col sm:gap-0.5 sm:px-0.5"
              onClick={() => onToggleComments(post.id)}
              aria-label={`${commentCount} comentários`}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-[10px] font-medium tabular-nums">{commentCount}</span>
            </button>
          </div>

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

              {hasText && (() => {
                const { title, body } = parsePostText(post.text);
                return title ? (
                  <div className="space-y-1.5">
                    <p className="post-title text-[var(--text-primary)]">
                      {title}
                    </p>
                    {body ? (
                      <p className="post-body whitespace-pre-wrap break-words">
                        {body}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="body-base whitespace-pre-wrap break-words text-[var(--text-primary)] leading-[1.6]">
                    {post.text}
                  </p>
                );
              })()}

              {hasMedia ? (
                <LazyMediaCarousel
                  urls={resolvedMediaUrls}
                  aspect="video"
                  onImageClick={handleImageClick}
                  authorName={post.authorName}
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

            <div className="px-3 pb-3 pt-2 sm:px-4 sm:pb-2.5">
              <CanhoesDecorativeDivider tone="purple" className="mt-1" />
              <div className="mt-2">
                <HubPostActions
                  postId={post.id}
                  commentCount={commentCount}
                  reactionCounts={reactionCounts}
                  myReactions={post.myReactions ?? []}
                  isPinned={post.isPinned}
                  commentsExpanded={openComments}
                  onToggleReaction={handleReaction}
                  onToggleComments={onToggleComments}
                />
              </div>

              <AnimatePresence initial={false}>
                {openComments ? (
                  <motion.div
                    ref={commentsRef}
                    key={`${post.id}-comments`}
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-2 overflow-hidden"
                  >
                    <LazyHubPostComments
                      postId={post.id}
                      postAuthorName={post.authorName}
                      comments={comments}
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
                      onToggleCommentReaction={onToggleCommentReaction}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
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

      <EmojiBurstContainer bursts={bursts} onClear={clearBursts} />
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
