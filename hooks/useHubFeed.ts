import { useCallback, useEffect, useMemo, useState } from "react";
import { type InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import type { EventFeedPostFullDto } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

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

function sortPosts(posts: EventFeedPostFullDto[], sort: FeedSortOrder): EventFeedPostFullDto[] {
  const sorted = [...posts];
  const pinned = sorted.filter((post) => post.isPinned);
  const rest = sorted.filter((post) => !post.isPinned);

  switch (sort) {
    case "hot":
      rest.sort((a, b) => hotScore(b) - hotScore(a));
      break;
    case "top":
      rest.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
      break;
    case "new":
    default:
      rest.sort((a, b) => String(b.createdAtUtc).localeCompare(String(a.createdAtUtc)));
      break;
  }

  return [...pinned, ...rest];
}

function sanitizePosts(posts: EventFeedPostFullDto[] | null | undefined) {
  return (Array.isArray(posts) ? posts : []).filter(
    (post): post is EventFeedPostFullDto => Boolean(post?.id)
  );
}

function prependPostToFeed(
  old: FeedInfiniteData | undefined,
  createdPost: EventFeedPostFullDto
): FeedInfiniteData | undefined {
  if (!old) return old;

  const [firstPage, ...restPages] = old.pages;
  if (!firstPage) return old;

  return {
    ...old,
    pages: [
      {
        ...firstPage,
        posts: [createdPost, ...firstPage.posts.filter((post) => post.id !== createdPost.id)],
      },
      ...restPages,
    ],
  };
}

export function useHubFeed(eventId: string | null) {
  const queryClient = useQueryClient();
  const [sort, setSort] = useState<FeedSortOrder>("hot");

  const postsQuery = useInfiniteQuery({
    queryKey: ["hub-posts", eventId],
    enabled: Boolean(eventId),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const data = (await canhoesEventsRepo.getFeedPosts(eventId!, {
        skip: pageParam,
        take: PAGE_SIZE,
      })) as FeedApiResponse;

      const posts = sanitizePosts(data.items ?? []);
      const nextSkip = data.hasMore ? pageParam + PAGE_SIZE : null;

      return {
        posts,
        nextCursor: nextSkip,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const safePosts = useMemo(
    () => postsQuery.data?.pages.flatMap((page) => page.posts) ?? [],
    [postsQuery.data]
  );

  const displayedPosts = useMemo(() => sortPosts(safePosts, sort), [safePosts, sort]);
  const allPostsCount = displayedPosts.length;

  const { comments, openComments, commentDrafts, toggleComments, addComment, deleteComment, toggleCommentReaction, setCommentDraft } =
    useHubFeedComments({ eventId, posts: safePosts, queryClient });

  const {
    showParticles,
    setShowParticles,
    toggleReaction,
    toggleDownvote,
    votePoll,
    adminPin,
    adminDelete,
  } = useHubFeedPostActions({ eventId, queryClient });

  const hasMore = postsQuery.hasNextPage ?? false;
  const isFetchingNextPage = postsQuery.isFetchingNextPage;

  const loadMore = useCallback(() => {
    if (hasMore && !isFetchingNextPage) {
      void postsQuery.fetchNextPage();
    }
  }, [hasMore, isFetchingNextPage, postsQuery]);

  const refreshPosts = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["hub-posts", eventId] });
  }, [queryClient, eventId]);

  useEffect(() => {
    const handlePostCreated = (event: Event) => {
      const createdPost = (event as CustomEvent<EventFeedPostFullDto | undefined>).detail;
      if (!createdPost?.id) return;

      queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) =>
        prependPostToFeed(old, createdPost)
      );
    };

    globalThis.addEventListener("hub:postCreated", handlePostCreated);
    return () => globalThis.removeEventListener("hub:postCreated", handlePostCreated);
  }, [queryClient, eventId]);

  return {
    posts: displayedPosts,
    allPostsCount,
    errorMessage: postsQuery.error ? getErrorMessage(postsQuery.error, "Erro ao carregar o feed.") : null,
    loading: postsQuery.isLoading,
    sort,
    setSort,
    hasMore,
    loadMore,
    isFetchingNextPage,
    comments,
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
    adminDelete,
    setCommentDraft,
  };
}
