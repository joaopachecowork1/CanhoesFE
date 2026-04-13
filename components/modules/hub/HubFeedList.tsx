"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ScrollText } from "lucide-react";

import { PostErrorBoundary } from "@/components/ui/post-error-boundary";
import { EmptyState } from "@/components/ui/empty-state";
import { feedCopy } from "@/lib/canhoesCopy";
import type { EventFeedPostFullDto, HubCommentDto } from "@/lib/api/types";
import type { FeedSortOrder } from "@/hooks/useHubFeed";

import { FeedLoadMore } from "./FeedLoadMore";
import { FeedSortBar } from "./FeedSortBar";
import { HubPostCard } from "./HubPostCard";

type HubFeedListProps = {
  posts: EventFeedPostFullDto[];
  sort: FeedSortOrder;
  allPostsCount: number;
  isAdmin: boolean;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  currentUserId: string | null;
  currentUserImage: string | null;
  currentUserName: string;
  comments: Record<string, HubCommentDto[]>;
  openComments: Record<string, boolean>;
  commentDrafts: Record<string, string>;
  onSortChange: (sort: FeedSortOrder) => void;
  onLoadMore: () => void;
  onToggleReaction: (postId: string, emoji: string, e?: React.MouseEvent) => void;
  onToggleDownvote: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onAddComment: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onCommentDraftChange: (postId: string, text: string) => void;
  onToggleCommentReaction: (postId: string, commentId: string, emoji: string) => void;
  onAdminPin: (postId: string) => void;
  onAdminDelete: (postId: string) => void;
  sentinelRef: React.MutableRefObject<HTMLDivElement | null>;
};

export function HubFeedList({
  posts,
  sort,
  allPostsCount,
  isAdmin,
  hasMore,
  isFetchingNextPage,
  currentUserId,
  currentUserImage,
  currentUserName,
  comments,
  openComments,
  commentDrafts,
  onSortChange,
  onLoadMore,
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
  sentinelRef,
}: Readonly<HubFeedListProps>) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sort}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="space-y-3"
      >
        {posts.length > 0 ? (
          <FeedSortBar
            allPostsCount={allPostsCount}
            sort={sort}
            onSortChange={onSortChange}
          />
        ) : null}

        {posts.map((post, index) => (
          <PostErrorBoundary key={post.id}>
            <HubPostCard
              post={post}
              index={index}
              isAdmin={isAdmin}
              openComments={openComments[post.id] ?? false}
              commentDraft={commentDrafts[post.id] ?? ""}
              comments={comments[post.id] ?? []}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserImage={currentUserImage}
              onToggleReaction={onToggleReaction}
              onToggleDownvote={onToggleDownvote}
              onToggleComments={onToggleComments}
              onVotePoll={onVotePoll}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
              onCommentDraftChange={onCommentDraftChange}
              onToggleCommentReaction={onToggleCommentReaction}
              onAdminPin={onAdminPin}
              onAdminDelete={onAdminDelete}
            />
          </PostErrorBoundary>
        ))}

        <FeedLoadMore
          hasMore={hasMore}
          isFetchingNextPage={isFetchingNextPage}
          remainingCount={allPostsCount - posts.length}
          onLoadMore={onLoadMore}
          sentinelRef={sentinelRef}
        />

        {posts.length === 0 ? (
          <EmptyState
            className="py-10"
            icon={ScrollText}
            title={feedCopy.empty.title}
            description={feedCopy.empty.description}
            tone="social"
          />
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
