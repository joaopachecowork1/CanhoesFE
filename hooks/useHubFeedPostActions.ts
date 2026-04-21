import { useCallback, useEffect, useState } from "react";
import { type InfiniteData, type QueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { EventFeedPostFullDto } from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { HEART_REACTION } from "@/lib/reactions";

export type HubFeedParticlesState = {
  postId: string;
  x: number;
  y: number;
} | null;

type FeedPageData = {
  posts: EventFeedPostFullDto[];
  nextCursor: number | null;
};

type FeedInfiniteData = InfiniteData<FeedPageData>;

type UseHubFeedPostActionsArgs = {
  eventId: string | null;
  queryClient: QueryClient;
};

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

function sortPinnedPosts(old: FeedInfiniteData | undefined) {
  if (!old) return old;

  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      posts: [...page.posts].sort((left, right) =>
        Number(Boolean(right.isPinned)) - Number(Boolean(left.isPinned)) ||
        String(right.createdAtUtc).localeCompare(String(left.createdAtUtc))
      ),
    })),
  };
}

export function useHubFeedPostActions({
  eventId,
  queryClient,
}: Readonly<UseHubFeedPostActionsArgs>) {
  const [showParticles, setShowParticles] = useState<HubFeedParticlesState>(null);

  useEffect(() => {
    setShowParticles(null);
  }, [eventId]);

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

      const previousFeed = queryClient.getQueryData<FeedInfiniteData>(["hub-posts", eventId]);
      const previousPost = findPostInFeed(previousFeed, postId);

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
    [queryClient, eventId]
  );

  const adminPin = useCallback(async (postId: string) => {
    if (!eventId) return;

    try {
      const result = await canhoesEventsRepo.adminPinFeedPost(eventId, postId);
      queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) => {
        const updated = updateInfiniteFeedPosts(old, (post) =>
          post.id === postId ? { ...post, isPinned: result.pinned } : post
        );

        return sortPinnedPosts(updated);
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
    showParticles,
    setShowParticles,
    toggleReaction,
    toggleDownvote,
    votePoll,
    adminPin,
    adminDelete,
  };
}
