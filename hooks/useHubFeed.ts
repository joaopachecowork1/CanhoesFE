"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { EventFeedPostFullDto, HubCommentDto } from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

export type FeedSortOrder = "hot" | "new" | "top";

const HEART_REACTION = "\u2764\uFE0F";

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

function updatePostById(
  posts: EventFeedPostFullDto[],
  postId: string,
  updater: (post: EventFeedPostFullDto) => EventFeedPostFullDto
) {
  return posts.map((post) => (post.id === postId ? updater(post) : post));
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

  // TanStack Query for posts — uses event-scoped canhoesEventsRepo
  const postsQuery = useQuery({
    queryKey: ["hub-posts", eventId],
    enabled: Boolean(eventId),
    queryFn: async () => {
      const data = await canhoesEventsRepo.getFeedPosts(eventId!);
      return sanitizePosts(data);
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const safePosts = postsQuery.data ?? [];

  // Apply sorting
  const sortedPosts = useCallback(
    () => sortPosts(safePosts, sort),
    [safePosts, sort]
  );

  // Pagination — show first 15, load more on demand
  const PAGE_SIZE = 15;
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);
  const displayedPosts = sortedPosts().slice(0, displayedCount);
  const allPostsCount = sortedPosts().length;
  const hasMore = displayedCount < allPostsCount;

  const loadMore = useCallback(() => {
    setDisplayedCount((prev) => prev + PAGE_SIZE);
  }, []);

  const refreshPosts = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["hub-posts", eventId] });
  }, [queryClient, eventId]);

  // Listen for new posts via custom event
  useEffect(() => {
    const handlePostCreated = (event: Event) => {
      const createdPost = (event as CustomEvent<EventFeedPostFullDto | undefined>).detail;
      if (!createdPost?.id) return;

      queryClient.setQueryData<EventFeedPostFullDto[]>(["hub-posts", eventId], (old) => {
        if (!old) return [createdPost];
        const nextPosts = old.filter((post) => post.id !== createdPost.id);
        return [createdPost, ...nextPosts];
      });
    };

    globalThis.addEventListener("hub:postCreated", handlePostCreated);
    return () =>
      globalThis.removeEventListener("hub:postCreated", handlePostCreated);
  }, [queryClient, eventId]);

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
      queryClient.setQueryData<EventFeedPostFullDto[]>(["hub-posts", eventId], (old) => {
        if (!old) return old;
        previousPost = old.find((post) => post.id === postId);
        return updatePostById(old, postId, (post) => applyPostReaction(post, emoji));
      });

      try {
        if (emoji === HEART_REACTION) {
          const result = await toggleReactionMutation.mutateAsync({ postId, emoji }) as { liked: boolean };
          queryClient.setQueryData<EventFeedPostFullDto[]>(["hub-posts", eventId], (old) =>
            old ? updatePostById(old, postId, (post) => {
              const myReactions = new Set(post.myReactions ?? []);
              if (result.liked) myReactions.add(HEART_REACTION);
              else myReactions.delete(HEART_REACTION);
              return { ...post, likedByMe: result.liked, myReactions: Array.from(myReactions) };
            }) : old
          );
          return;
        }
        await toggleReactionMutation.mutateAsync({ postId, emoji });
      } catch (error) {
        if (previousPost) {
          queryClient.setQueryData<EventFeedPostFullDto[]>(["hub-posts", eventId], (old) =>
            old ? updatePostById(old, postId, () => previousPost!) : old
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
      queryClient.setQueryData<EventFeedPostFullDto[]>(["hub-posts", eventId], (old) => {
        if (!old) return old;
        previousPost = old.find((post) => post.id === postId);
        return updatePostById(old, postId, (post) => {
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
        queryClient.setQueryData<EventFeedPostFullDto[]>(["hub-posts", eventId], (old) =>
          old ? updatePostById(old, postId, (post) => ({
            ...post,
            downvotedByMe: result.downvoted,
            downvoteCount: result.downvoted
              ? (post.downvoteCount ?? 0) + (post.downvotedByMe ? 0 : 1)
              : Math.max(0, (post.downvoteCount ?? 0) - (post.downvotedByMe ? 1 : 0)),
          })) : old
        );
      } catch (error) {
        if (previousPost) {
          queryClient.setQueryData<EventFeedPostFullDto[]>(["hub-posts", eventId], (old) =>
            old ? updatePostById(old, postId, () => previousPost!) : old
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

      queryClient.setQueryData<EventFeedPostFullDto[]>(["hub-posts", eventId], (old) =>
        old ? updatePostById(old, postId, (post) => applyPollVote(post, optionId)) : old
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
        queryClient.setQueryData<EventFeedPostFullDto[]>(["hub-posts", eventId], (old) =>
          old ? updatePostById(old, postId, (post) => ({
            ...post,
            commentCount: (post.commentCount ?? 0) + 1,
          })) : old
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
      queryClient.setQueryData<EventFeedPostFullDto[]>(["hub-posts", eventId], (old) =>
        old ? updatePostById(old, postId, (post) => ({
          ...post,
          commentCount: Math.max(0, (post.commentCount ?? 0) - 1),
        })) : old
      );

      try {
        await canhoesEventsRepo.deleteFeedPostComment(eventId, postId, commentId);
        toast.success("Comentario removido");
      } catch (error) {
        setComments((currentComments) => ({
          ...currentComments,
          [postId]: previousComments,
        }));
        queryClient.setQueryData<EventFeedPostFullDto[]>(["hub-posts", eventId], (old) =>
          old ? updatePostById(old, postId, (post) => ({
            ...post,
            commentCount: (post.commentCount ?? 0) + 1,
          })) : old
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
      queryClient.setQueryData<EventFeedPostFullDto[]>(["hub-posts", eventId], (old) =>
        old ? [...old]
          .map((post) => post.id === postId ? { ...post, isPinned: result.pinned } : post)
          .sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)) || String(b.createdAtUtc).localeCompare(String(a.createdAtUtc))) : old
      );
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
      queryClient.setQueryData<EventFeedPostFullDto[]>(["hub-posts", eventId], (old) =>
        old ? old.filter((post) => post.id !== postId) : old
      );
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
