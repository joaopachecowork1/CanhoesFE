"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { ScrollText } from "lucide-react";

import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import { useHubFeed } from "@/lib/domains/feed/components/hooks/useHubFeed";
import { useEventOverview } from "@/hooks/useEventOverview";
import { useAuth } from "@/hooks/useAuth";
import { feedCopy } from "@/lib/canhoesCopy";
import { useIsAdmin } from "@/lib/domains/auth/services/useIsAdmin";
import { CanhoesModuleHeader } from "@/components/modules/canhoes/CanhoesModuleParts";
import { ErrorAlert } from "@/components/ui/error-alert";
import { HubFeedList } from "./HubFeedList";
import { useFeedInfiniteScroll } from "./useFeedInfiniteScroll";
import type { EventFeedPostFullDto } from "@/lib/api/types";

type FeedPageData = {
  posts: EventFeedPostFullDto[];
  nextCursor: number | null;
};

type FeedInfiniteData = { pages: FeedPageData[]; pageParams: unknown[] };

export function HubFeedModule({
  initialData,
  initialContext,
}: Readonly<{
  initialData?: FeedInfiniteData;
  initialContext?: import("@/lib/api/types").EventActiveContextDto | null;
}>) {
  const state = useHubFeedModuleState(initialData, initialContext);

  if (state.loading && !initialData) return <FeedSkeleton count={3} />;

  return <HubFeedModuleView state={state} />;
}

function HubFeedModuleView({
  state,
}: Readonly<{
  state: ReturnType<typeof useHubFeedModuleState>;
}>) {
  const {
    posts,
    allPostsCount,
    errorMessage,
    sort,
    setSort,
    hasMore,
    isFetchingNextPage,
    openComments,
    commentDrafts,
    toggleReaction,
    toggleDownvote,
    votePoll,
    toggleComments,
    addComment,
    deleteComment,
    setCommentDraft,
    adminPin,
    adminMovePinned,
    adminDelete,
    refresh,
    currentUserId,
    currentUserImage,
    currentUserName,
    isAdmin,
    sentinelRef,
  } = state;

  const handleRetry = useCallback(() => void refresh(), [refresh]);
  const handleSortChange = useCallback((nextSort: typeof sort) => setSort(nextSort), [setSort]);
  const handleLoadMore = state.loadMore;

  const feedList = (
    <HubFeedList
      posts={posts}
      sort={sort}
      allPostsCount={allPostsCount}
      eventId={state.eventId ?? ""}
      isAdmin={isAdmin}
      hasMore={hasMore}
      isFetchingNextPage={isFetchingNextPage}
      currentUserId={currentUserId}
      currentUserImage={currentUserImage}
      currentUserName={currentUserName}
      openComments={openComments}
      commentDrafts={commentDrafts}
      onSortChange={handleSortChange}
      onLoadMore={handleLoadMore}
      onToggleReaction={toggleReaction}
      onToggleDownvote={toggleDownvote}
      onToggleComments={toggleComments}
      onVotePoll={votePoll}
      onAddComment={addComment}
      onDeleteComment={deleteComment}
      onCommentDraftChange={setCommentDraft}
      onAdminPin={adminPin}
      onAdminMovePinned={adminMovePinned}
      onAdminDelete={adminDelete}
      sentinelRef={sentinelRef}
    />
  );

  return (
    <div className="zone-feed mx-auto w-full max-w-3xl space-y-3 px-3 sm:px-0">
      <CanhoesModuleHeader icon={ScrollText} title={feedCopy.hero.title} description={feedCopy.hero.description} />
      {errorMessage ? <ErrorAlert title="Erro ao carregar o mural" description={errorMessage} actionLabel="Tentar novamente" tone="social" onAction={handleRetry} /> : null}
      {feedList}
    </div>
  );
}

function useHubFeedModuleState(initialData?: FeedInfiniteData, initialContext?: import("@/lib/api/types").EventActiveContextDto | null) {
  const { data: session } = useSession();
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const isAdmin = useIsAdmin();
  const { event: activeEvent } = useEventOverview(initialContext);
  const eventId = activeEvent?.id ?? null;
  const feed = useHubFeed(eventId, currentUserId, initialData);
  const sentinelRef = useFeedInfiniteScroll({ enabled: feed.hasMore, isFetchingNextPage: feed.isFetchingNextPage, onLoadMore: feed.loadMore });
  const currentUserName = session?.user?.name?.trim() || session?.user?.email?.trim() || "Tu";
  const currentUserImage = session?.user?.image ?? null;

  return {
    ...feed,
    eventId,
    currentUserId,
    currentUserImage,
    currentUserName,
    isAdmin,
    loadMore: feed.loadMore,
    sentinelRef,
  };
}
