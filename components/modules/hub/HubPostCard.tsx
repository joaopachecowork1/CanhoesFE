"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { BlurFade } from "@/components/animations/BlurFade";
import type { HubCommentDto, HubPostDto } from "@/lib/api/types";

import { HubPostActions } from "./components/HubPostActions";
import { HubPostComments } from "./components/HubPostComments";
import { MediaCarousel } from "./components/MediaCarousel";
import { PollBox } from "./components/PollBox";
import { PostHeader } from "./components/PostHeader";

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
  const mediaUrls = Array.from(
    new Set(
      [...(post.mediaUrls ?? []), post.mediaUrl].filter(
        (value): value is string => Boolean(value)
      )
    )
  );
  const reactionCounts = post.reactionCounts || {};

  const hasMedia = mediaUrls.length > 0;
  const hasText = !!(post.text?.trim());

  return (
    <BlurFade delay={index * 50}>
      <article className="canhoes-feed-card overflow-hidden rounded-[var(--radius-lg-token)] transition-shadow hover:shadow-[var(--glow-green-sm)] hover:shadow-lg">
        <div className="space-y-2 px-3 pt-3 sm:px-4">
          <PostHeader
            authorName={post.authorName}
            createdAtUtc={post.createdAtUtc}
            isPinned={post.isPinned}
            isAdmin={isAdmin}
            onAdminPin={() => onAdminPin(post.id)}
            onAdminDelete={() => onAdminDelete(post.id)}
          />

          {hasText && (
            <p className="body-base whitespace-pre-wrap break-words text-[var(--text-primary)] leading-[1.6]">
              {post.text}
            </p>
          )}

          {hasMedia && <MediaCarousel urls={mediaUrls} aspect="video" />}
        </div>

        {post.poll && (
          <div className="px-3 pb-2 pt-1 sm:px-4">
            <PollBox
              poll={post.poll}
              onVote={(optionId) => onVotePoll(post.id, optionId)}
            />
          </div>
        )}

        <div className="px-3 pb-3 sm:px-4">
          <div className="mt-2 h-px w-full bg-[var(--border-subtle)]" />
          <div className="mt-2">
            <HubPostActions
              postId={post.id}
              commentCount={post.commentCount ?? 0}
              reactionCounts={reactionCounts}
              myReactions={post.myReactions ?? []}
              likeCount={post.likeCount ?? 0}
              isPinned={post.isPinned}
              commentsExpanded={openComments}
              onToggleReaction={onToggleReaction}
              onToggleComments={onToggleComments}
            />
          </div>

          <AnimatePresence initial={false}>
            {openComments ? (
              <motion.div
                key={`${post.id}-comments`}
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="mt-2 overflow-hidden"
              >
                <HubPostComments
                  postId={post.id}
                  postAuthorName={post.authorName}
                  comments={comments}
                  commentCount={post.commentCount ?? 0}
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
      </article>
    </BlurFade>
  );
}

// OPTIMIZATION: Memoize to prevent unnecessary re-renders when parent state changes
export const HubPostCard = memo(HubPostCardComponent);
