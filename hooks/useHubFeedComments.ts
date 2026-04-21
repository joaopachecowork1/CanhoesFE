import { useCallback, useEffect, useRef, useState } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { EventFeedPostFullDto, HubCommentDto } from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

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

export function useHubFeedComments({ eventId, posts, queryClient }: Readonly<UseHubFeedCommentsArgs>) {
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, HubCommentDto[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const fetchedCommentPostsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchedCommentPostsRef.current = new Set();
    setOpenComments({});
    setComments({});
    setCommentDrafts({});
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;

    const postIdsNeedingPreview = posts
      .filter(
        (post) =>
          (post.commentCount ?? 0) > 0 &&
          !fetchedCommentPostsRef.current.has(post.id) &&
          comments[post.id] === undefined
      )
      .map((post) => post.id);

    if (postIdsNeedingPreview.length === 0) return;

    let cancelled = false;
    postIdsNeedingPreview.forEach((id) => fetchedCommentPostsRef.current.add(id));

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
  }, [comments, eventId, posts]);

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
        queryClient.setQueryData<FeedInfiniteData>([FEED_POSTS_QUERY_KEY, eventId], (old) =>
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
    [commentDrafts, eventId, queryClient]
  );

  const toggleCommentReaction = useCallback(
    async (postId: string, commentId: string, emoji: string) => {
      if (!eventId) return;

      setComments((currentComments) => ({
        ...currentComments,
        [postId]: (currentComments[postId] ?? []).map((comment) => {
          if (comment.id !== commentId) return comment;

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
        }),
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
      queryClient.setQueryData<FeedInfiniteData>([FEED_POSTS_QUERY_KEY, eventId], (old) =>
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
        queryClient.setQueryData<FeedInfiniteData>([FEED_POSTS_QUERY_KEY, eventId], (old) =>
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
    [comments, eventId, queryClient]
  );

  const setCommentDraft = useCallback((postId: string, text: string) => {
    setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [postId]: text }));
  }, []);

  return {
    comments,
    openComments,
    commentDrafts,
    toggleComments,
    addComment,
    deleteComment,
    toggleCommentReaction,
    setCommentDraft,
  };
}
