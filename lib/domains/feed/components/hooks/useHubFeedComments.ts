import { useCallback, useEffect, useRef, useState } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { EventFeedPostFullDto, HubCommentDto } from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { feedRepo } from "@/lib/repositories/feedRepo";

export const COMMENTS_QUERY_KEY = "hub-comments";
const FEED_POSTS_QUERY_KEY = "hub-posts";

type FeedInfiniteData = {
  pages: Array<{
    posts: EventFeedPostFullDto[];
  }>;
};

type UseHubFeedCommentsArgs = {
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

export function useHubFeedComments({ eventId, queryClient }: Readonly<UseHubFeedCommentsArgs>) {
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentDraftsMap, setCommentDraftsMap] = useState<Record<string, string>>({});
  const commentDraftsRef = useRef(commentDraftsMap);
  commentDraftsRef.current = commentDraftsMap;

  useEffect(() => {
    setOpenComments({});
    setCommentDraftsMap({});
  }, [eventId]);

  const toggleComments = useCallback((postId: string) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  const addComment = useCallback(
    async (postId: string) => {
      if (!eventId) return;
      const text = (commentDraftsRef.current[postId] ?? "").trim();
      if (!text) return;

      try {
        const newComment = await feedRepo.createComment(eventId, postId, { text });

        setCommentDraftsMap((prev) => ({ ...prev, [postId]: "" }));
        setOpenComments((prev) => ({ ...prev, [postId]: true }));

        if (newComment) {
          queryClient.setQueryData<HubCommentDto[]>([COMMENTS_QUERY_KEY, postId], (prev) =>
            [...(prev ?? []), newComment]
          );
        }
        queryClient.setQueryData<FeedInfiniteData>([FEED_POSTS_QUERY_KEY, eventId], (prev) =>
          updateInfiniteFeedPosts(prev, (post) =>
            post.id === postId
              ? { ...post, commentCount: (post.commentCount ?? 0) + 1 }
              : post
          )
        );
        toast.success("Comentário publicado");
      } catch (error) {
        const msg = getErrorMessage(error, "Não foi possível publicar o comentário.");
        logFrontendError("HubFeed.addComment", error, { postId });
        toast.error(msg);
      }
    },
    [eventId, queryClient]
  );

  const toggleCommentReaction = useCallback(
    async (postId: string, commentId: string, emoji: string) => {
      if (!eventId) return;

      queryClient.setQueryData<HubCommentDto[]>([COMMENTS_QUERY_KEY, postId], (prev) =>
        (prev ?? []).map((comment) => {
          if (comment.id !== commentId) return comment;
          const myReactions = new Set(comment.myReactions ?? []);
          const wasActive = myReactions.has(emoji);
          if (wasActive) myReactions.delete(emoji);
          else myReactions.add(emoji);
          const reactionCounts = { ...comment.reactionCounts };
          reactionCounts[emoji] = Math.max(0, (reactionCounts[emoji] ?? 0) + (wasActive ? -1 : 1));
          return { ...comment, myReactions: Array.from(myReactions), reactionCounts };
        })
      );

      try {
        await feedRepo.toggleCommentReaction(eventId, postId, commentId, emoji);
      } catch (error) {
        queryClient.invalidateQueries({ queryKey: [COMMENTS_QUERY_KEY, postId] });
        const msg = getErrorMessage(error, "Não foi possível atualizar a reação.");
        logFrontendError("HubFeed.toggleCommentReaction", error, { commentId, emoji, postId });
        toast.error(msg);
      }
    },
    [eventId, queryClient]
  );

  const deleteComment = useCallback(
    async (postId: string, commentId: string) => {
      if (!eventId) return;

      const prev = queryClient.getQueryData<HubCommentDto[]>([COMMENTS_QUERY_KEY, postId]) ?? [];
      const updated = prev.filter((c) => c.id !== commentId);
      if (updated.length === prev.length) return;

      queryClient.setQueryData<HubCommentDto[]>([COMMENTS_QUERY_KEY, postId], updated);
      queryClient.setQueryData<FeedInfiniteData>([FEED_POSTS_QUERY_KEY, eventId], (prevFeed) =>
        updateInfiniteFeedPosts(prevFeed, (post) =>
          post.id === postId
            ? { ...post, commentCount: Math.max(0, (post.commentCount ?? 0) - 1) }
            : post
        )
      );

      try {
        await feedRepo.deleteComment(eventId, postId, commentId);
        toast.success("Comentário removido");
      } catch (error) {
        queryClient.setQueryData<HubCommentDto[]>([COMMENTS_QUERY_KEY, postId], prev);
        queryClient.setQueryData<FeedInfiniteData>([FEED_POSTS_QUERY_KEY, eventId], (prevFeed) =>
          updateInfiniteFeedPosts(prevFeed, (post) =>
            post.id === postId
              ? { ...post, commentCount: (post.commentCount ?? 0) + 1 }
              : post
          )
        );
        const msg = getErrorMessage(error, "Não foi possível remover o comentário.");
        logFrontendError("HubFeed.deleteComment", error, { commentId, postId });
        toast.error(msg);
      }
    },
    [eventId, queryClient]
  );

  const setCommentDraft = useCallback((postId: string, text: string) => {
    setCommentDraftsMap((prev) => ({ ...prev, [postId]: text }));
  }, []);

  return {
    openComments,
    commentDrafts: commentDraftsMap,
    toggleComments,
    addComment,
    deleteComment,
    toggleCommentReaction,
    setCommentDraft,
  };
}
