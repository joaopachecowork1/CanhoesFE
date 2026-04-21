import { useCallback, useEffect, useMemo, useState } from "react";
import { type InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { EventFeedPostFullDto } from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { HEART_REACTION } from "@/lib/reactions";

import { useHubFeedComments } from "./useHubFeedComments";

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

/**
 * Reddit-style hot scoring: (reactions + comments * 2) / (hours + 2)^1.5
 */
function hotScore(post: EventFeedPostFullDto): number {
  const reactionCount = Object.values(post.reactionCounts ?? {}).reduce((a, b) => a + b, 0);
  const commentCount = post.commentCount ?? 0;
  const hoursAgo = Math.max(0, (Date.now() - new Date(post.createdAtUtc).getTime()) / 3600000);
  return (reactionCount + commentCount * 2) / Math.pow(hoursAgo + 2, 1.5);
}

function sortPosts(posts: EventFeedPostFullDto[], sort: FeedSortOrder): EventFeedPostFullDto[] {
  const sorted = [...posts];
  const [pinned, rest] = [
    sorted.filter((p) => p.isPinned),
    sorted.filter((p) => !p.isPinned),
  ];

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
  const sanitized = (Array.isArray(posts) ? posts : []).filter(
    (post): post is EventFeedPostFullDto => Boolean(post?.id)
  );

  return sanitized;
}

function applyPostReaction(post: EventFeedPostFullDto, emoji: string) {
  const myReactions = new Set(post.myReactions ?? []);
  const wasActive = myReactions.has(emoji);

  if (wasActive) myReactions.delete(emoji);
  else myReactions.add(emoji);

  const reactionCounts = { ...post.reactionCounts };
  reactionCounts[emoji] = Math.max(
    0,
    (reactionCounts[emoji] ?? 0) + (wasActive ? -1 : 1)
  );

  let nextLikeCount = post.likeCount ?? 0;
  if (emoji === HEART_REACTION) {
    nextLikeCount = Math.max(0, nextLikeCount + (wasActive ? -1 : 1));
  }

  return {
    ...post,
    likeCount: nextLikeCount,
    likedByMe: emoji === HEART_REACTION ? !wasActive : post.likedByMe,
    myReactions: Array.from(myReactions),
    reactionCounts,
  };
}

function applyPollVote(post: EventFeedPostFullDto, optionId: string) {
  if (!post.poll) return post;

  const currentPoll = post.poll;
  const previousOptionId = currentPoll.myOptionId ?? null;
  if (previousOptionId === optionId) return post;

  const options = currentPoll.options.map((option) => {
    if (option.id === optionId) {
      return { ...option, voteCount: option.voteCount + 1 };
    }

    if (previousOptionId && option.id === previousOptionId) {
      return { ...option, voteCount: Math.max(0, option.voteCount - 1) };
    }

    return option;
  });

  return {
    ...post,
    poll: {
      ...currentPoll,
      myOptionId: optionId,
      options,
      totalVotes: previousOptionId
        ? currentPoll.totalVotes
        : currentPoll.totalVotes + 1,
    },
  };
}

function updateInfiniteFeedPosts(
  old: FeedInfiniteData | undefined,
  updater: (post: EventFeedPostFullDto) => EventFeedPostFullDto
): FeedInfiniteData | undefined {
  if (!old) return old;

  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      posts: page.posts.map(updater),
    })),
  };
}

function findPostInFeed(old: FeedInfiniteData | undefined, postId: string) {
  return old?.pages.flatMap((page) => page.posts).find((post) => post.id === postId);
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
  const [showParticles, setShowParticles] = useState<{
    postId: string;
    x: number;
    y: number;
  } | null>(null);

  // Infinite query for paginated posts
  const postsQuery = useInfiniteQuery({
    queryKey: ["hub-posts", eventId],
    enabled: Boolean(eventId),
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const data = await canhoesEventsRepo.getFeedPosts(eventId!, {
        skip: pageParam,
        take: PAGE_SIZE,
      }) as FeedApiResponse;

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

  // Flatten all pages into a single array
  const safePosts = useMemo(
    () => postsQuery.data?.pages.flatMap((page) => page.posts) ?? [],
    [postsQuery.data]
  );

  const displayedPosts = useMemo(
    () => sortPosts(safePosts, sort),
    [safePosts, sort]
  );

  const allPostsCount = displayedPosts.length;

  useEffect(() => {
    setShowParticles(null);
  }, [eventId]);

  const {
    comments,
    openComments,
    commentDrafts,
    toggleComments,
    addComment,
    deleteComment,
    toggleCommentReaction,
    setCommentDraft,
  } = useHubFeedComments({ eventId, posts: safePosts, queryClient });

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

  // Listen for new posts via custom event
  useEffect(() => {
    const handlePostCreated = (event: Event) => {
      const createdPost = (event as CustomEvent<EventFeedPostFullDto | undefined>).detail;
      if (!createdPost?.id) return;

      queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) =>
        prependPostToFeed(old, createdPost)
      );
    };

    globalThis.addEventListener("hub:postCreated", handlePostCreated);
    return () =>
      globalThis.removeEventListener("hub:postCreated", handlePostCreated);
  }, [queryClient, eventId]);


  // Mutations
  const toggleReactionMutation = useMutation({
    mutationFn: async ({ postId, emoji }: { postId: string; emoji: string }) => {
      if (!eventId) throw new Error("Missing eventId");
      if (emoji === HEART_REACTION) return canhoesEventsRepo.toggleFeedPostLike(eventId, postId);
      return canhoesEventsRepo.toggleFeedPostReaction(eventId, postId, emoji);
    },
  });

  const toggleReaction = useCallback(
    async (postId: string, emoji: string) => {
      if (!eventId) return;

      let previousPost: EventFeedPostFullDto | undefined;
      let appliedOptimisticUpdate = false;
      queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) => {
        previousPost = findPostInFeed(old, postId);
        appliedOptimisticUpdate = Boolean(previousPost);
        return updateInfiniteFeedPosts(old, (post) =>
          post.id === postId ? applyPostReaction(post, emoji) : post
        );
      });

      try {
        const result = await toggleReactionMutation.mutateAsync({ postId, emoji }) as { liked: boolean };
        queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) =>
          updateInfiniteFeedPosts(old, (post) => {
            if (post.id !== postId) return post;
            const myReactions = new Set(post.myReactions ?? []);
            if (result.liked) myReactions.add(HEART_REACTION);
            else myReactions.delete(HEART_REACTION);
            return { ...post, likedByMe: result.liked, myReactions: Array.from(myReactions) };
          })
        );
      } catch (error) {
        if (appliedOptimisticUpdate && previousPost) {
          queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) =>
            updateInfiniteFeedPosts(old, (post) =>
              post.id === previousPost!.id ? previousPost! : post
            )
          );
        }
        const message = getErrorMessage(error, "Nao foi possivel atualizar a reacao do post.");
        logFrontendError("HubFeed.toggleReaction", error, { emoji, postId });
        toast.error(message);
      }
    },
    [queryClient, toggleReactionMutation, eventId]
  );

  const toggleDownvote = useCallback(
    async (postId: string) => {
      if (!eventId) return;

      let previousPost: EventFeedPostFullDto | undefined;
      queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) => {
        previousPost = findPostInFeed(old, postId);
        return updateInfiniteFeedPosts(old, (post) => {
          if (post.id !== postId) return post;
          const wasDownvoted = post.downvotedByMe ?? false;
          return {
            ...post,
            downvotedByMe: !wasDownvoted,
            downvoteCount: Math.max(0, (post.downvoteCount ?? 0) + (wasDownvoted ? -1 : 1)),
          };
        });
      });

      try {
        const result = await canhoesEventsRepo.toggleFeedPostDownvote(eventId, postId);
        queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) =>
          updateInfiniteFeedPosts(old, (post) => {
            if (post.id !== postId) return post;
            return {
              ...post,
              downvotedByMe: result.downvoted,
              downvoteCount: result.downvoted
                ? (post.downvoteCount ?? 0) + (post.downvotedByMe ? 0 : 1)
                : Math.max(0, (post.downvoteCount ?? 0) - (post.downvotedByMe ? 1 : 0)),
            };
          })
        );
      } catch (error) {
        if (previousPost) {
          queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) =>
            updateInfiniteFeedPosts(old, (post) =>
              post.id === previousPost!.id ? previousPost! : post
            )
          );
        }
        const message = getErrorMessage(error, "Nao foi possivel atualizar o downvote do post.");
        logFrontendError("HubFeed.toggleDownvote", error, { postId });
        toast.error(message);
      }
    },
    [queryClient, eventId]
  );

  const votePoll = useCallback(
    async (postId: string, optionId: string) => {
      if (!eventId) return;

      setShowParticles({ postId, x: 50, y: 50 });

      const previousPost = findPostInFeed(postsQuery.data, postId);
      queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) =>
        updateInfiniteFeedPosts(old, (post) =>
          post.id === postId ? applyPollVote(post, optionId) : post
        )
      );

      try {
        await canhoesEventsRepo.voteFeedPoll(eventId, postId, optionId);
      } catch (error) {
        if (previousPost) {
          queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) =>
            updateInfiniteFeedPosts(old, (post) =>
              post.id === previousPost.id ? previousPost : post
            )
          );
        }
        const message = getErrorMessage(error, "Nao foi possivel registar o teu voto.");
        logFrontendError("HubFeed.votePoll", error, { optionId, postId });
        toast.error(message);
      }
    },
    [queryClient, eventId, postsQuery.data]
  );


  const adminPin = useCallback(async (postId: string) => {
    if (!eventId) return;

    try {
      const result = await canhoesEventsRepo.adminPinFeedPost(eventId, postId);
      queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) => {
        const updated = updateInfiniteFeedPosts(old, (post) =>
          post.id === postId ? { ...post, isPinned: result.pinned } : post
        );

        if (!updated) return updated;

        return {
          ...updated,
          pages: updated.pages.map((page) => ({
            ...page,
            posts: [...page.posts].sort((a, b) =>
              Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)) ||
              String(b.createdAtUtc).localeCompare(String(a.createdAtUtc))
            ),
          })),
        };
      });
    } catch (error) {
      const message = getErrorMessage(error, "Nao foi possivel atualizar o destaque do post.");
      logFrontendError("HubFeed.adminPin", error, { postId });
      toast.error(message);
    }
  }, [queryClient, eventId]);

  const adminDelete = useCallback(async (postId: string) => {
    if (!eventId) return;

    try {
      await canhoesEventsRepo.adminDeleteFeedPost(eventId, postId);
      queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.filter((post) => post.id !== postId),
          })),
        };
      });
      toast.success("Post removido");
    } catch (error) {
      const message = getErrorMessage(error, "Nao foi possivel remover o post.");
      logFrontendError("HubFeed.adminDelete", error, { postId });
      toast.error(message);
    }
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
