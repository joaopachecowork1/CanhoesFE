import { useCallback, useEffect, useMemo, useState } from "react";
import { type InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import type { EventFeedPostFullDto } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/errors";
import { feedRepo } from "@/lib/repositories/feedRepo";

import { useHubFeedComments } from "./useHubFeedComments";
import { useHubFeedPostActions } from "./useHubFeedPostActions";

export type FeedSortOrder = "hot" | "new" | "top";
const PAGE_SIZE = 15;

type FeedPageData = {
  posts: EventFeedPostFullDto[];
  nextCursor: number | null;
};

type FeedApiResponse = {
  items: EventFeedPostFullDto[];
  total: number;
  skip: number;
  take: number;
  hasMore: boolean;
};

type FeedInfiniteData = InfiniteData<FeedPageData>;

function hotScore(post: EventFeedPostFullDto): number {
  const reactionCount = Object.values(post.reactionCounts ?? {}).reduce((a, b) => a + b, 0);
  const commentCount = post.commentCount ?? 0;
  const hoursAgo = Math.max(0, (Date.now() - new Date(post.createdAtUtc).getTime()) / 3600000);
  return (reactionCount + commentCount * 2) / Math.pow(hoursAgo + 2, 1.5);
}

function sortPosts(allPosts: EventFeedPostFullDto[], sortOrder: FeedSortOrder): EventFeedPostFullDto[] {
  const postsToSort = [...allPosts];
  const pinnedPosts = postsToSort.filter((post) => post.isPinned);
  const regularPosts = postsToSort.filter((post) => !post.isPinned);

  switch (sortOrder) {
    case "hot":
      regularPosts.sort((a, b) => hotScore(b) - hotScore(a));
      break;
    case "top":
      regularPosts.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
      break;
    case "new":
    default:
      regularPosts.sort((a, b) => String(b.createdAtUtc).localeCompare(String(a.createdAtUtc)));
      break;
  }

  return [...pinnedPosts, ...regularPosts];
}

function sanitizePosts(rawPosts: EventFeedPostFullDto[] | null | undefined) {
  return (Array.isArray(rawPosts) ? rawPosts : []).filter(
    (post): post is EventFeedPostFullDto => Boolean(post?.id)
  );
}

export function useHubFeed(eventId: string | null, _currentUserId: string | null, initialData?: FeedInfiniteData) {
  const queryClient = useQueryClient();
  const [sortOrder, setSortOrder] = useState<FeedSortOrder>("hot");

  const postsInfiniteQuery = useInfiniteQuery({
    queryKey: ["hub-posts", eventId],
    enabled: Boolean(eventId),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const feedApiResponse = (await feedRepo.getPosts(eventId!, {
        skip: pageParam as number,
        take: PAGE_SIZE,
      })) as FeedApiResponse;

      const sanitizedPosts = sanitizePosts(feedApiResponse.items ?? []);
      const nextPageSkip = feedApiResponse.hasMore ? (pageParam as number) + PAGE_SIZE : null;

      return {
        posts: sanitizedPosts,
        nextCursor: nextPageSkip,
      };
    },
    initialData,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: () =>
      typeof document !== "undefined" && document.visibilityState === "visible" ? 15_000 : false,
  });

  const allSanitizedPosts = useMemo(
    () => postsInfiniteQuery.data?.pages.flatMap((page) => page.posts) ?? [],
    [postsInfiniteQuery.data]
  );

  const sortedDisplayedPosts = useMemo(() => sortPosts(allSanitizedPosts, sortOrder), [allSanitizedPosts, sortOrder]);
  const totalPostsInView = sortedDisplayedPosts.length;

  const { openComments, commentDrafts, toggleComments, addComment, deleteComment, toggleCommentReaction, setCommentDraft } =
    useHubFeedComments({ eventId, queryClient });

  const {
    showParticles,
    setShowParticles,
    toggleReaction,
    toggleDownvote,
    votePoll,
    adminPin,
    adminMovePinned,
    adminDelete,
  } = useHubFeedPostActions({ eventId, queryClient });

  const hasMorePosts = postsInfiniteQuery.hasNextPage ?? false;
  const isFetchingNextPage = postsInfiniteQuery.isFetchingNextPage;

  const loadMorePosts = useCallback(() => {
    if (hasMorePosts && !isFetchingNextPage) {
      void postsInfiniteQuery.fetchNextPage();
    }
  }, [hasMorePosts, isFetchingNextPage, postsInfiniteQuery]);

  const refreshPosts = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["hub-posts", eventId] });
  }, [queryClient, eventId]);

  useEffect(() => {
    const handlePostCreated = () => void refreshPosts();
    window.addEventListener("hub:postCreated", handlePostCreated);
    return () => window.removeEventListener("hub:postCreated", handlePostCreated);
  }, [refreshPosts]);

  return {
    posts: sortedDisplayedPosts,
    allPostsCount: totalPostsInView,
    errorMessage: postsInfiniteQuery.error ? getErrorMessage(postsInfiniteQuery.error, "Erro ao carregar o feed.") : null,
    loading: postsInfiniteQuery.isLoading,
    sort: sortOrder,
    setSort: setSortOrder,
    hasMore: hasMorePosts,
    loadMore: loadMorePosts,
    isFetchingNextPage,
    openComments,
    commentDrafts,
    showParticles,
    setShowParticles,
    refresh: refreshPosts,
    toggleReaction,
    toggleDownvote,
    votePoll,
    toggleComments,
    addComment,
    deleteComment,
    toggleCommentReaction,
    adminPin,
    adminMovePinned,
    adminDelete,
    setCommentDraft,
  };
}
