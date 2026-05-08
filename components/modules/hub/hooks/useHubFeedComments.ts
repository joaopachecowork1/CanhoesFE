import { useCallback, useEffect, useState } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { EventFeedPostFullDto, HubCommentDto } from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { feedRepo } from "@/lib/repositories/feedRepo";

const FEED_POSTS_QUERY_KEY = "hub-posts";

type FeedInfiniteData = {
  pages: Array<{
    posts: EventFeedPostFullDto[];
  }>;
};

type UseHubFeedCommentsArgs = {
  eventId: string | null;
  posts: EventFeedPostFullDto[];
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

export function useHubFeedComments({ eventId, queryClient }: Readonly<Omit<UseHubFeedCommentsArgs, 'posts'>>) {
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, HubCommentDto[]>>({});
  const [commentDraftsMap, setCommentDraftsMap] = useState<Record<string, string>>({});
  const [loadingCommentsMap, setLoadingCommentsMap] = useState<Record<string, boolean>>({});

  // Clean up when event changes
  useEffect(() => {
    setOpenComments({});
    setCommentsMap({});
    setCommentDraftsMap({});
    setLoadingCommentsMap({});
  }, [eventId]);

  const fetchComments = useCallback(
    async (postId: string) => {
      if (!eventId || loadingCommentsMap[postId]) return;

      setLoadingCommentsMap((previousLoadingState) => ({ ...previousLoadingState, [postId]: true }));
      try {
        const fetchedComments = await feedRepo.getComments(eventId, postId);
        setCommentsMap((previousCommentsMap) => ({
          ...previousCommentsMap,
          [postId]: (fetchedComments ?? []).filter(Boolean),
        }));
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Não foi possível carregar os comentários deste post.");
        logFrontendError("HubFeed.fetchComments", error, { postId });
        toast.error(errorMessage);
      } finally {
        setLoadingCommentsMap((previousLoadingState) => ({ ...previousLoadingState, [postId]: false }));
      }
    },
    [eventId, loadingCommentsMap]
  );

  const toggleComments = useCallback(
    async (postId: string) => {
      const isOpening = !openComments[postId];
      
      setOpenComments((previousOpenState) => ({
        ...previousOpenState,
        [postId]: isOpening,
      }));

      // Fetch on-demand if opening and not already loaded
      if (isOpening && !commentsMap[postId]) {
        await fetchComments(postId);
      }
    },
    [commentsMap, fetchComments, openComments]
  );

  const addComment = useCallback(
    async (postId: string) => {
      if (!eventId) return;

      const commentDraftText = (commentDraftsMap[postId] ?? "").trim();
      if (!commentDraftText) return;

      try {
        const newlyCreatedComment = await feedRepo.createComment(eventId, postId, { text: commentDraftText });

        setCommentDraftsMap((previousDraftsMap) => ({ ...previousDraftsMap, [postId]: "" }));
        setOpenComments((previousOpenState) => ({ ...previousOpenState, [postId]: true }));
        setCommentsMap((previousCommentsMap) => ({
          ...previousCommentsMap,
          [postId]: [
            ...(previousCommentsMap[postId] ?? []),
            ...(newlyCreatedComment ? [newlyCreatedComment] : []),
          ],
        }));
        queryClient.setQueryData<FeedInfiniteData>([FEED_POSTS_QUERY_KEY, eventId], (previousFeedData) =>
          updateInfiniteFeedPosts(previousFeedData, (post) =>
            post.id === postId
              ? { ...post, commentCount: (post.commentCount ?? 0) + 1 }
              : post
          )
        );
        toast.success("Comentário publicado");
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Não foi possível publicar o comentário.");
        logFrontendError("HubFeed.addComment", error, { postId });
        toast.error(errorMessage);
      }
    },
    [commentDraftsMap, eventId, queryClient]
  );

  const toggleCommentReaction = useCallback(
    async (postId: string, commentId: string, emoji: string) => {
      if (!eventId) return;

      setCommentsMap((previousCommentsMap) => ({
        ...previousCommentsMap,
        [postId]: (previousCommentsMap[postId] ?? []).map((comment) => {
          if (comment.id !== commentId) return comment;

          const myReactions = new Set(comment.myReactions ?? []);
          const wasReactionActive = myReactions.has(emoji);

          if (wasReactionActive) myReactions.delete(emoji);
          else myReactions.add(emoji);

          const reactionCounts = { ...comment.reactionCounts };
          reactionCounts[emoji] = Math.max(
            0,
            (reactionCounts[emoji] ?? 0) + (wasReactionActive ? -1 : 1)
          );

          return {
            ...comment,
            myReactions: Array.from(myReactions),
            reactionCounts,
          };
        }),
      }));

      try {
        await feedRepo.toggleCommentReaction(eventId, postId, commentId, emoji);
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Não foi possível atualizar a reação do comentário.");
        logFrontendError("HubFeed.toggleCommentReaction", error, { commentId, emoji, postId });
        toast.error(errorMessage);
        try {
          const refreshedComments = await feedRepo.getComments(eventId, postId);
          setCommentsMap((previousCommentsMap) => ({
            ...previousCommentsMap,
            [postId]: (refreshedComments ?? []).filter(Boolean),
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

      const rollbackCommentsList = commentsMap[postId] ?? [];
      const updatedCommentsList = rollbackCommentsList.filter(
        (comment) => comment.id !== commentId
      );

      if (updatedCommentsList.length === rollbackCommentsList.length) return;

      setCommentsMap((previousCommentsMap) => ({
        ...previousCommentsMap,
        [postId]: updatedCommentsList,
      }));
      queryClient.setQueryData<FeedInfiniteData>([FEED_POSTS_QUERY_KEY, eventId], (previousFeedData) =>
        updateInfiniteFeedPosts(previousFeedData, (post) =>
          post.id === postId
            ? { ...post, commentCount: Math.max(0, (post.commentCount ?? 0) - 1) }
            : post
          )
      );

      try {
        await feedRepo.deleteComment(eventId, postId, commentId);
        toast.success("Comentário removido");
      } catch (error) {
        setCommentsMap((previousCommentsMap) => ({
          ...previousCommentsMap,
          [postId]: rollbackCommentsList,
        }));
        queryClient.setQueryData<FeedInfiniteData>([FEED_POSTS_QUERY_KEY, eventId], (previousFeedData) =>
          updateInfiniteFeedPosts(previousFeedData, (post) =>
            post.id === postId
              ? { ...post, commentCount: (post.commentCount ?? 0) + 1 }
              : post
          )
        );
        const errorMessage = getErrorMessage(error, "Não foi possível remover o comentário.");
        logFrontendError("HubFeed.deleteComment", error, { commentId, postId });
        toast.error(errorMessage);
      }
    },
    [commentsMap, eventId, queryClient]
  );

  const setCommentDraft = useCallback((postId: string, draftText: string) => {
    setCommentDraftsMap((previousDraftsMap) => ({ ...previousDraftsMap, [postId]: draftText }));
  }, []);

  return {
    comments: commentsMap,
    openComments,
    commentDrafts: commentDraftsMap,
    toggleComments,
    addComment,
    deleteComment,
    toggleCommentReaction,
    setCommentDraft,
  };
}
