"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ArrowBigUp, MessageSquare } from "lucide-react";

import { BlurFade } from "@/components/animations/BlurFade";
import type { HubCommentDto, HubPostDto } from "@/lib/api/types";
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
  post: HubPostDto;
  index: number;
  isAdmin: boolean;
  openComments: boolean;
  commentDraft: string;
  comments?: HubCommentDto[];
  currentUserId?: string | null;
  currentUserName: string;
  currentUserImage?: string | null;
  onToggleReaction: (postId: string, emoji: string) => void;
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
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const commentsRef = useRef<HTMLDivElement>(null);

  // Scroll to comments when they open
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
  const likeCount = post.likeCount ?? reactionCounts["❤️"] ?? 0;

  const hasMedia = resolvedMediaUrls.length > 0;
  const hasText = !!(post.text?.trim());

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
    if (userVote === "up") {
      setUserVote(null);
      onToggleReaction(post.id, HEART_REACTION);
    } else {
      if (userVote === "down") {
        onToggleReaction(post.id, HEART_REACTION);
      } else {
        onToggleReaction(post.id, HEART_REACTION);
      }
      setUserVote("up");
    }
  }, [userVote, post.id, onToggleReaction]);

  const handleDownvote = useCallback(() => {
    if (userVote === "down") {
      setUserVote(null);
    } else {
      if (userVote === "up") {
        onToggleReaction(post.id, HEART_REACTION);
      }
      setUserVote("down");
    }
  }, [userVote, post.id, onToggleReaction]);

  const displayScore = likeCount + (userVote === "up" ? 1 : 0) - (userVote === "down" ? 1 : 0);

  const commentCount = post.commentCount ?? 0;

  return (
    <BlurFade delay={index * 50}>
      <article className="reddit-post flex overflow-hidden rounded-[var(--radius-md-token)]">
        {/* Vote sidebar (Reddit-style) */}
        <div className="reddit-vote-sidebar flex flex-col items-center gap-0.5 border-r border-[var(--border-subtle)] bg-[var(--bg-void)] px-1.5 py-2 sm:px-2 sm:py-3">
          <button
            type="button"
            onClick={handleUpvote}
            className={cn(
              "canhoes-tap rounded p-0.5 transition-colors",
              userVote === "up"
                ? "text-[var(--neon-green)]"
                : "text-[var(--text-muted)] hover:text-[var(--neon-green)]"
            )}
            aria-label={userVote === "up" ? "Remover upvote" : "Upvote"}
          >
            <ArrowBigUp className="h-5 w-5" />
          </button>

          <span className={cn(
            "reddit-score font-mono text-xs font-bold tabular-nums",
            userVote === "up" ? "text-[var(--neon-green)]" :
            userVote === "down" ? "text-[var(--neon-red)]" :
            "text-[var(--text-primary)]"
          )}>
            {displayScore}
          </span>

          <button
            type="button"
            onClick={handleDownvote}
            className={cn(
              "canhoes-tap rounded p-0.5 transition-colors",
              userVote === "down"
                ? "text-[var(--neon-red)]"
                : "text-[var(--text-muted)] hover:text-[var(--neon-red)]"
            )}
            aria-label={userVote === "down" ? "Remover downvote" : "Downvote"}
          >
            <ArrowBigUp className="h-5 w-5 rotate-180" />
          </button>

          <button
            type="button"
            className="canhoes-tap mt-2 flex flex-col items-center gap-0.5 rounded p-0.5 text-[var(--text-muted)] transition-colors hover:text-[var(--moss-glow)]"
            onClick={() => onToggleComments(post.id)}
            aria-label={`${commentCount} comentários`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-[10px] font-medium tabular-nums">{commentCount}</span>
          </button>
        </div>

        {/* Content area */}
        <div className="min-w-0 flex-1">
          <div className="space-y-2 px-3 pt-2.5 sm:px-4">
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
                <div className="space-y-1">
                  <p className="post-title text-[var(--text-primary)]">
                    {title}
                  </p>
                  {body && (
                    <p className="post-body whitespace-pre-wrap break-words">
                      {body}
                    </p>
                  )}
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

          {post.poll && (
            <div className="px-3 pb-2 pt-1 sm:px-4">
              <LazyPollBox
                poll={post.poll}
                onVote={(optionId) => onVotePoll(post.id, optionId)}
              />
            </div>
          )}

          {/* Action bar */}
          <div className="px-3 pb-2.5 pt-2 sm:px-4">
            <div className="mt-1 h-px w-full bg-[var(--border-subtle)]" />
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

        {/* Image Lightbox */}
        <ImageLightbox
          images={resolvedMediaUrls}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          authorName={post.authorName}
          createdAtUtc={post.createdAtUtc}
        />
      </article>

      {/* Emoji burst particles */}
      <EmojiBurstContainer bursts={bursts} onClear={clearBursts} />
    </BlurFade>
  );
}

export const HubPostCard = memo(HubPostCardComponent);

function FeedMediaFallback() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-deep)]">
      <div className="h-48 w-full animate-pulse bg-[rgba(245,237,224,0.06)]" />
    </div>
  );
}

function FeedPollFallback() {
  return (
    <div className="rounded-[var(--radius-lg-token)] border border-[var(--color-moss)]/15 bg-[var(--color-bg-surface)] p-4 sm:p-5">
      <div className="space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-[rgba(74,92,47,0.18)]" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-[rgba(74,92,47,0.12)]" />
        <div className="h-12 animate-pulse rounded-[var(--radius-md-token)] bg-[rgba(245,237,224,0.08)]" />
        <div className="h-12 animate-pulse rounded-[var(--radius-md-token)] bg-[rgba(245,237,224,0.08)]" />
      </div>
    </div>
  );
}
