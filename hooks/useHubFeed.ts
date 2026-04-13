"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { EventFeedPostFullDto, HubCommentDto } from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

export type FeedSortOrder = "hot" | "new" | "top";
const PAGE_SIZE = 15;
const HEART_REACTION = "\u2764\uFE0F";

type FeedPageData = {
  posts: EventFeedPostFullDto[];
  nextCursor: number | null;
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
  return (Array.isArray(posts) ? posts : []).filter(
    (post): post is EventFeedPostFullDto => Boolean(post?.id)
  );
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

function applyCommentReaction(comment: HubCommentDto, emoji: string) {
  const myReactions = new Set(comment.myReactions ?? []);
  const wasActive = myReactions.has(emoji);

  if (wasActive) myReactions.delete(emoji);
  else myReactions.add(emoji);

  const reactionCounts = { ...comment.reactionCounts };
  reactionCounts[emoji] = Math.max(
    0,
    (reactionCounts[emoji] ?? 0) + (wasActive ? -1 : 1)
  );

  return {
    ...comment,
    myReactions: Array.from(myReactions),
    reactionCounts,
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
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, HubCommentDto[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
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
      });
      const posts = sanitizePosts(data.posts ?? []);
      return {
        posts,
        nextCursor: data.nextCursor ?? (posts.length < PAGE_SIZE ? null : pageParam + PAGE_SIZE),
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
    [postsQuery.data?.pages]
  );

  // Apply sorting client-side (backend should handle this in future)
  const sortedPosts = useMemo(
    () => sortPosts(safePosts, sort),
    [safePosts, sort]
  );

  const displayedPosts = sortedPosts;
  const allPostsCount = sortedPosts.length;
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
  }, [queryClient, eventId, postsQuery.data?.pages]);

  // Pre-fetch comments for posts that have them
  const fetchedCommentPostsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!eventId) return;

    const postIdsNeedingPreview = safePosts
      .filter(
        (post) =>
          (post.commentCount ?? 0) > 0 &&
          !fetchedCommentPostsRef.current.has(post.id) &&
          comments[post.id] === undefined
      )
      .map((post) => post.id);

    if (postIdsNeedingPreview.length === 0) return;

    let cancelled = false;
    postIdsNeedingPreview.forEach(id => fetchedCommentPostsRef.current.add(id));

    void Promise.allSettled(
      postIdsNeedingPreview.map(async (postId) => {
        try {
          const list = await canhoesEventsRepo.getFeedPostComments(eventId, postId);
          if (cancelled) return;

          setComments((currentComments) =>
            currentComments[postId] === undefined
              ? { ...currentComments, [postId]: (list ?? []).filter(Boolean) }
              : currentComments
          );
        } catch {
          fetchedCommentPostsRef.current.delete(postId);
        }
      })
    );

    return () => {
      cancelled = true;
    };
  }, [safePosts, comments, eventId]);

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
      queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) => {
        previousPost = findPostInFeed(old, postId);
        return updateInfiniteFeedPosts(old, (post) =>
          post.id === postId ? applyPostReaction(post, emoji) : post
        );
      });

      try {
        if (emoji === HEART_REACTION) {
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
          return;
        }
        await toggleReactionMutation.mutateAsync({ postId, emoji });
      } catch (error) {
        if (previousPost) {
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

      queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) =>
        updateInfiniteFeedPosts(old, (post) =>
          post.id === postId ? applyPollVote(post, optionId) : post
        )
      );

      try {
        await canhoesEventsRepo.voteFeedPoll(eventId, postId, optionId);
      } catch (error) {
        const message = getErrorMessage(error, "Nao foi possivel registar o teu voto.");
        logFrontendError("HubFeed.votePoll", error, { optionId, postId });
        toast.error(message);
        await refreshPosts();
      }
    },
    [queryClient, refreshPosts, eventId]
  );

  const toggleComments = useCallback(
    async (postId: string) => {
      if (!eventId) return;

      setOpenComments((currentState) => ({
        ...currentState,
        [postId]: !currentState[postId],
      }));

      if (comments[postId]) return;

      try {
        const list = await canhoesEventsRepo.getFeedPostComments(eventId, postId);
        setComments((currentComments) => ({
          ...currentComments,
          [postId]: (list ?? []).filter(Boolean),
        }));
      } catch (error) {
        const message = getErrorMessage(error, "Nao foi possivel carregar os comentarios deste post.");
        logFrontendError("HubFeed.toggleComments", error, { postId });
        toast.error(message);
      }
    },
    [comments, eventId]
  );

  const addComment = useCallback(
    async (postId: string) => {
      if (!eventId) return;

      const draft = (commentDrafts[postId] ?? "").trim();
      if (!draft) return;

      try {
        const createdComment = await canhoesEventsRepo.createFeedPostComment(eventId, postId, { text: draft });

        setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [postId]: "" }));
        setOpenComments((currentState) => ({ ...currentState, [postId]: true }));
        setComments((currentComments) => ({
          ...currentComments,
          [postId]: [
            ...(currentComments[postId] ?? []),
            ...(createdComment ? [createdComment] : []),
          ],
        }));
        queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) =>
          updateInfiniteFeedPosts(old, (post) =>
            post.id === postId
              ? { ...post, commentCount: (post.commentCount ?? 0) + 1 }
              : post
          )
        );
      } catch (error) {
        const message = getErrorMessage(error, "Nao foi possivel publicar o comentario.");
        logFrontendError("HubFeed.addComment", error, { postId });
        toast.error(message);
      }
    },
    [commentDrafts, queryClient, eventId]
  );

  const toggleCommentReaction = useCallback(
    async (postId: string, commentId: string, emoji: string) => {
      if (!eventId) return;

      setComments((currentComments) => ({
        ...currentComments,
        [postId]: (currentComments[postId] ?? []).map((comment) =>
          comment.id === commentId ? applyCommentReaction(comment, emoji) : comment
        ),
      }));

      try {
        await canhoesEventsRepo.toggleFeedCommentReaction(eventId, postId, commentId, emoji);
      } catch (error) {
        const message = getErrorMessage(error, "Nao foi possivel atualizar a reacao do comentario.");
        logFrontendError("HubFeed.toggleCommentReaction", error, { commentId, emoji, postId });
        toast.error(message);
        try {
          const list = await canhoesEventsRepo.getFeedPostComments(eventId, postId);
          setComments((currentComments) => ({
            ...currentComments,
            [postId]: (list ?? []).filter(Boolean),
          }));
        } catch {
          // Keep the optimistic state if the recovery fetch also fails.
        }
      }
    },
    [eventId]
  );

  const deleteComment = useCallback(
    async (postId: string, commentId: string) => {
      if (!eventId) return;

      const previousComments = comments[postId] ?? [];
      const nextComments = previousComments.filter(
        (comment) => comment.id !== commentId
      );

      if (nextComments.length === previousComments.length) return;

      setComments((currentComments) => ({
        ...currentComments,
        [postId]: nextComments,
      }));
      queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) =>
        updateInfiniteFeedPosts(old, (post) =>
          post.id === postId
            ? { ...post, commentCount: Math.max(0, (post.commentCount ?? 0) - 1) }
            : post
        )
      );

      try {
        await canhoesEventsRepo.deleteFeedPostComment(eventId, postId, commentId);
        toast.success("Comentario removido");
      } catch (error) {
        setComments((currentComments) => ({
          ...currentComments,
          [postId]: previousComments,
        }));
        queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) =>
          updateInfiniteFeedPosts(old, (post) =>
            post.id === postId
              ? { ...post, commentCount: (post.commentCount ?? 0) + 1 }
              : post
          )
        );
        const message = getErrorMessage(error, "Nao foi possivel remover o comentario.");
        logFrontendError("HubFeed.deleteComment", error, { commentId, postId });
        toast.error(message);
      }
    },
    [comments, queryClient, eventId]
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

  const setCommentDraft = useCallback((postId: string, text: string) => {
    setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [postId]: text }));
  }, []);

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
