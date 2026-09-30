import { useCallback, useEffect, useMemo } from "react";
import { type InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import type { EventFeedPostFullDto } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/errors";
import { feedRepo } from "@/lib/repositories/feedRepo";

import { useHubFeedComments } from "./useHubFeedComments";
import { useHubFeedPostActions } from "./useHubFeedPostActions";

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

function sanitizePosts(rawPosts: EventFeedPostFullDto[] | null | undefined) {
  return (Array.isArray(rawPosts) ? rawPosts : []).filter(
    (post): post is EventFeedPostFullDto => Boolean(post?.id)
  );
}

export function useHubFeed(eventId: string | null, _currentUserId: string | null, initialData?: FeedInfiniteData) {
  const queryClient = useQueryClient();

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

  const sortedDisplayedPosts = allSanitizedPosts;
  const totalPostsInView = sortedDisplayedPosts.length;

  const { openComments, commentDrafts, replyingTo, toggleComments, addComment, deleteComment, toggleCommentReaction, setCommentDraft, setReplyingTo } =
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
    hasMore: hasMorePosts,
    loadMore: loadMorePosts,
    isFetchingNextPage,
    openComments,
    commentDrafts,
    replyingTo,
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
    setReplyingTo,
  };
}
