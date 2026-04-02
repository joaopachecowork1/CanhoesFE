"use client";

import React from "react";

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
  currentUserName: string;
  currentUserImage?: string | null;
  onToggleReaction: (postId: string, emoji: string) => void;
  onToggleComments: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onAddComment: (postId: string) => void;
  showCommentComposer: boolean;
  onOpenCommentComposer: (postId: string) => void;
  onCommentDraftChange: (postId: string, text: string) => void;
  onToggleCommentReaction: (
    postId: string,
    commentId: string,
    emoji: string
  ) => void;
  onAdminPin: (postId: string) => void;
  onAdminDelete: (postId: string) => void;
}

export function HubPostCard({
  post,
  index,
  isAdmin,
  openComments,
  commentDraft,
  comments = [],
  currentUserName,
  currentUserImage,
  onToggleReaction,
  onToggleComments,
  onVotePoll,
  onAddComment,
  showCommentComposer,
  onOpenCommentComposer,
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
  const reactionCountTotal =
    Object.keys(reactionCounts).length > 0
      ? Object.values(reactionCounts).reduce(
          (total, currentValue) => total + currentValue,
          0
        )
      : (post.likeCount ?? 0);
  return (
    <BlurFade delay={index * 50}>
      <article className="canhoes-feed-card overflow-hidden rounded-[var(--radius-lg-token)]">
        <div className="space-y-2 px-3 pt-3 sm:px-4">
          <PostHeader
            authorName={post.authorName}
            createdAtUtc={post.createdAtUtc}
            isPinned={post.isPinned}
            isAdmin={isAdmin}
            onAdminPin={() => onAdminPin(post.id)}
            onAdminDelete={() => onAdminDelete(post.id)}
          />

          {post.text ? (
            <p className="body-base whitespace-pre-wrap break-words text-[var(--text-primary)]">
              {post.text}
            </p>
          ) : null}

          {mediaUrls.length > 0 ? (
            <MediaCarousel urls={mediaUrls} aspect="video" />
          ) : null}
        </div>

        {post.poll ? (
          <div className="px-3 pb-2 pt-1 sm:px-4">
            <PollBox
              poll={post.poll}
              onVote={(optionId) => onVotePoll(post.id, optionId)}
            />
          </div>
        ) : null}

        <div className="px-3 pb-3 sm:px-4">
          <div className="mt-2 h-px w-full bg-[var(--border-subtle)]" />
          <div className="mt-2">
            <HubPostActions
              postId={post.id}
              commentCount={post.commentCount ?? 0}
              reactionCountTotal={reactionCountTotal}
              reactionCounts={reactionCounts}
              myReactions={post.myReactions ?? []}
              likeCount={post.likeCount ?? 0}
              isPinned={post.isPinned}
              commentsExpanded={openComments}
              onToggleReaction={onToggleReaction}
              onToggleComments={onToggleComments}
              onOpenCommentComposer={() => onOpenCommentComposer(post.id)}
            />
          </div>

          {openComments ? (
            <div className="mt-2">
              <HubPostComments
                postId={post.id}
                postAuthorName={post.authorName}
                comments={comments}
                commentCount={post.commentCount ?? 0}
                openComments={openComments}
                commentDraft={commentDraft}
                showComposer={showCommentComposer}
                currentUserName={currentUserName}
                currentUserImage={currentUserImage}
                onToggleComments={onToggleComments}
                onAddComment={onAddComment}
                onCommentDraftChange={onCommentDraftChange}
                onToggleCommentReaction={onToggleCommentReaction}
              />
            </div>
          ) : null}
        </div>
      </article>
    </BlurFade>
  );
}
