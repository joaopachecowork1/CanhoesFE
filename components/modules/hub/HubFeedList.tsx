"use client";

import { memo } from "react";
import { ScrollText } from "lucide-react";

import { SectionBoundary } from "@/components/ui/section-boundary";
import { EmptyState } from "@/components/ui/empty-state";
import { VirtualizedList } from "@/components/ui/virtualized-list";
import { feedCopy } from "@/lib/canhoesCopy";
import type { EventFeedPostFullDto } from "@/lib/api/types";
import type { FeedSortOrder } from "@/components/modules/hub/hooks/useHubFeed";

import { FeedLoadMore } from "./FeedLoadMore";
import { FeedSortBar } from "./FeedSortBar";
import { HubPostCard } from "./HubPostCard";

type HubFeedListProps = {
  posts: EventFeedPostFullDto[];
  sort: FeedSortOrder;
  allPostsCount: number;
  eventId: string;
  isAdmin: boolean;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  currentUserId: string | null;
  currentUserImage: string | null;
  currentUserName: string;
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
  onAdminPin: (postId: string) => void;
  onAdminDelete: (postId: string) => void;
  sentinelRef: React.MutableRefObject<HTMLDivElement | null>;
};

const POST_KEY = (post: EventFeedPostFullDto) => post.id;
const POST_SIZE = () => 220;

const HubFeedListItem = memo(function HubFeedListItem({
  post, index, eventId, isAdmin, openComments, commentDraft,
  currentUserId, currentUserName, currentUserImage,
  onToggleReaction, onToggleDownvote, onToggleComments, onVotePoll,
  onAddComment, onDeleteComment, onCommentDraftChange, onAdminPin, onAdminDelete,
}: {
  post: EventFeedPostFullDto; index: number; eventId: string; isAdmin: boolean;
  openComments: boolean; commentDraft: string;
  currentUserId: string | null; currentUserName: string; currentUserImage: string | null;
  onToggleReaction: (postId: string, emoji: string, e?: React.MouseEvent) => void;
  onToggleDownvote: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onAddComment: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onCommentDraftChange: (postId: string, text: string) => void;
  onAdminPin: (postId: string) => void;
  onAdminDelete: (postId: string) => void;
}) {
  return (
    <div className="mb-3">
      <SectionBoundary
        key={post.id}
        title="Erro no post"
        description="Ocorreu um erro ao renderizar este post."
      >
        <HubPostCard
          post={post}
          index={index}
          eventId={eventId}
          isAdmin={isAdmin}
          openComments={openComments}
          commentDraft={commentDraft}
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
          onAdminPin={onAdminPin}
          onAdminDelete={onAdminDelete}
        />
      </SectionBoundary>
    </div>
  );
});

export const HubFeedList = memo(function HubFeedList({
  posts,
  sort,
  allPostsCount,
  eventId,
  isAdmin,
  hasMore,
  isFetchingNextPage,
  currentUserId,
  currentUserImage,
  currentUserName,
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
  onAdminPin,
  onAdminDelete,
  sentinelRef,
}: Readonly<HubFeedListProps>) {
  return (
    <div key={sort} className="animate-fade-in space-y-3">
        {posts.length > 0 ? (
          <FeedSortBar
            allPostsCount={allPostsCount}
            sort={sort}
            onSortChange={onSortChange}
          />
        ) : null}

                {posts.length > 0 ? (
            <VirtualizedList
              items={posts}
              overscan={4}
              getKey={POST_KEY}
              estimateSize={POST_SIZE}
              useWindowScroll={true}
              renderItem={(post, index) => (
                <HubFeedListItem
                  post={post}
                  index={index}
                  eventId={eventId}
                  isAdmin={isAdmin}
                  openComments={openComments[post.id] ?? false}
                  commentDraft={commentDrafts[post.id] ?? ""}
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
                  onAdminPin={onAdminPin}
                  onAdminDelete={onAdminDelete}
                />
              )}
            />
        ) : (
          <EmptyState
            className="py-10"
            icon={ScrollText}
            title={feedCopy.empty.title}
            description={feedCopy.empty.description}
            tone="social"
          />
        )}

        <FeedLoadMore
          hasMore={hasMore}
          isFetchingNextPage={isFetchingNextPage}
          remainingCount={allPostsCount - posts.length}
          onLoadMore={onLoadMore}
          sentinelRef={sentinelRef}
        />
    </div>
  );
});
