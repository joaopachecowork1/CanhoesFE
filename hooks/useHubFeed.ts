"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type { HubCommentDto, HubPostDto } from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { hubRepo } from "@/lib/repositories/hubRepo";

const HEART_REACTION = "\u2764\uFE0F";

function sanitizePosts(posts: HubPostDto[] | null | undefined) {
  return (Array.isArray(posts) ? posts : []).filter(
    (post): post is HubPostDto => Boolean(post?.id)
  );
}

function updatePostById(
  posts: HubPostDto[],
  postId: string,
  updater: (post: HubPostDto) => HubPostDto
) {
  return posts.map((post) => (post.id === postId ? updater(post) : post));
}

function sortPinnedPosts(posts: HubPostDto[]) {
  return [...posts].sort(
    (left, right) =>
      Number(Boolean(right.isPinned)) - Number(Boolean(left.isPinned)) ||
      String(right.createdAtUtc).localeCompare(String(left.createdAtUtc))
  );
}

function applyPostReaction(post: HubPostDto, emoji: string) {
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

function applyPollVote(post: HubPostDto, optionId: string) {
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

export function useHubFeed() {
  const [posts, setPosts] = useState<HubPostDto[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, HubCommentDto[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  // Voting triggers a short celebratory overlay in the current experience.
  const [showParticles, setShowParticles] = useState<{
    postId: string;
    x: number;
    y: number;
  } | null>(null);

  const safePosts = useMemo(() => sanitizePosts(posts), [posts]);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await hubRepo.getPosts(50);
      setPosts(sanitizePosts(data));
    } catch (error) {
      const message = getErrorMessage(error, "Nao foi possivel carregar o feed.", {
        404: "O feed desta edicao ainda nao esta disponivel.",
      });
      logFrontendError("HubFeed.load", error);
      setErrorMessage(message);
      toast.error(message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // FIXED: Removed [load] dependency that caused duplicate requests
  useEffect(() => {
    void load();
  }, []); // Empty deps = runs once on mount only

  useEffect(() => {
    const handlePostCreated = (event: Event) => {
      const createdPost = (event as CustomEvent<HubPostDto | undefined>).detail;
      if (!createdPost?.id) return;

      setPosts((currentPosts) => {
        const nextPosts: HubPostDto[] = [];

        for (const post of currentPosts) {
          if (post.id === createdPost.id) continue;
          nextPosts.push(post);
        }

        return [createdPost, ...nextPosts];
      });
    };

    globalThis.addEventListener("hub:postCreated", handlePostCreated);
    return () =>
      globalThis.removeEventListener("hub:postCreated", handlePostCreated);
  }, []);

  // FIXED: Track which posts have had comments fetched to prevent cascade re-fetches
  const fetchedCommentPostsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
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

    // Mark these posts as being fetched to prevent duplicate requests
    postIdsNeedingPreview.forEach(id => fetchedCommentPostsRef.current.add(id));

    void Promise.allSettled(
      postIdsNeedingPreview.map(async (postId) => {
        try {
          const list = await hubRepo.getComments(postId);
          if (cancelled) return;

          setComments((currentComments) =>
            currentComments[postId] === undefined
              ? {
                  ...currentComments,
                  [postId]: (list ?? []).filter(Boolean),
                }
              : currentComments
          );
        } catch {
          // Remove from tracking set on failure so it can retry
          fetchedCommentPostsRef.current.delete(postId);
          // Inline previews fail silently; the post should still render.
        }
      })
    );

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePosts]); // FIXED: Removed [comments] dependency that caused cascade loop

  const toggleReaction = useCallback(
    async (postId: string, emoji: string) => {
      setPosts((currentPosts) =>
        updatePostById(currentPosts, postId, (post) =>
          applyPostReaction(post, emoji)
        )
      );

      try {
        if (emoji === HEART_REACTION) {
          const result = await hubRepo.toggleLike(postId);
          setPosts((currentPosts) =>
            updatePostById(currentPosts, postId, (post) => {
              const myReactions = new Set(post.myReactions ?? []);
              if (result.liked) myReactions.add(HEART_REACTION);
              else myReactions.delete(HEART_REACTION);

              return {
                ...post,
                likedByMe: result.liked,
                myReactions: Array.from(myReactions),
              };
            })
          );
          return;
        }

        await hubRepo.toggleReaction(postId, emoji);
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Nao foi possivel atualizar a reacao do post."
        );
        logFrontendError("HubFeed.toggleReaction", error, { emoji, postId });
        toast.error(message);
        void load();
      }
    },
    [load]
  );

  const votePoll = useCallback(
    async (postId: string, optionId: string) => {
      setShowParticles({ postId, x: 50, y: 50 });

      setPosts((currentPosts) =>
        updatePostById(currentPosts, postId, (post) =>
          applyPollVote(post, optionId)
        )
      );

      try {
        await hubRepo.votePoll(postId, optionId);
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Nao foi possivel registar o teu voto."
        );
        logFrontendError("HubFeed.votePoll", error, { optionId, postId });
        toast.error(message);
        void load();
      }
    },
    [load]
  );

  const toggleComments = useCallback(
    async (postId: string) => {
      setOpenComments((currentState) => ({
        ...currentState,
        [postId]: !currentState[postId],
      }));

      if (comments[postId]) return;

      try {
        const list = await hubRepo.getComments(postId);
        setComments((currentComments) => ({
          ...currentComments,
          [postId]: (list ?? []).filter(Boolean),
        }));
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Nao foi possivel carregar os comentarios deste post."
        );
        logFrontendError("HubFeed.toggleComments", error, { postId });
        toast.error(message);
      }
    },
    [comments]
  );

  const addComment = useCallback(
    async (postId: string) => {
      const draft = (commentDrafts[postId] ?? "").trim();
      if (!draft) return;

      try {
        const createdComment = await hubRepo.createComment(postId, { text: draft });

        setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [postId]: "" }));
        setOpenComments((currentState) => ({ ...currentState, [postId]: true }));
        setComments((currentComments) => ({
          ...currentComments,
          [postId]: [
            ...(currentComments[postId] ?? []),
            ...(createdComment ? [createdComment] : []),
          ],
        }));
        setPosts((currentPosts) =>
          updatePostById(currentPosts, postId, (post) => ({
            ...post,
            commentCount: (post.commentCount ?? 0) + 1,
          }))
        );
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Nao foi possivel publicar o comentario."
        );
        logFrontendError("HubFeed.addComment", error, { postId });
        toast.error(message);
      }
    },
    [commentDrafts]
  );

  const toggleCommentReaction = useCallback(
    async (postId: string, commentId: string, emoji: string) => {
      setComments((currentComments) => ({
        ...currentComments,
        [postId]: (currentComments[postId] ?? []).map((comment) =>
          comment.id === commentId ? applyCommentReaction(comment, emoji) : comment
        ),
      }));

      try {
        await hubRepo.toggleCommentReaction(postId, commentId, emoji);
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Nao foi possivel atualizar a reacao do comentario."
        );
        logFrontendError("HubFeed.toggleCommentReaction", error, {
          commentId,
          emoji,
          postId,
        });
        toast.error(message);
        try {
          const list = await hubRepo.getComments(postId);
          setComments((currentComments) => ({
            ...currentComments,
            [postId]: (list ?? []).filter(Boolean),
          }));
        } catch {
          // Keep the optimistic state if the recovery fetch also fails.
        }
      }
    },
    []
  );

  const deleteComment = useCallback(
    async (postId: string, commentId: string) => {
      const previousComments = comments[postId] ?? [];
      const nextComments = previousComments.filter(
        (comment) => comment.id !== commentId
      );

      if (nextComments.length === previousComments.length) return;

      setComments((currentComments) => ({
        ...currentComments,
        [postId]: nextComments,
      }));
      setPosts((currentPosts) =>
        updatePostById(currentPosts, postId, (post) => ({
          ...post,
          commentCount: Math.max(0, (post.commentCount ?? 0) - 1),
        }))
      );

      try {
        await hubRepo.deleteComment(postId, commentId);
        toast.success("Comentario removido");
      } catch (error) {
        setComments((currentComments) => ({
          ...currentComments,
          [postId]: previousComments,
        }));
        setPosts((currentPosts) =>
          updatePostById(currentPosts, postId, (post) => ({
            ...post,
            commentCount: (post.commentCount ?? 0) + 1,
          }))
        );
        const message = getErrorMessage(
          error,
          "Nao foi possivel remover o comentario."
        );
        logFrontendError("HubFeed.deleteComment", error, { commentId, postId });
        toast.error(message);
      }
    },
    [comments]
  );

  const adminPin = useCallback(async (postId: string) => {
    try {
      const result = await hubRepo.adminTogglePin(postId);
      setPosts((currentPosts) =>
        sortPinnedPosts(
          updatePostById(currentPosts, postId, (post) => ({
            ...post,
            isPinned: result.pinned,
          }))
        )
      );
    } catch (error) {
      const message = getErrorMessage(error, "Nao foi possivel atualizar o destaque do post.");
      logFrontendError("HubFeed.adminPin", error, { postId });
      toast.error(message);
    }
  }, []);

  const adminDelete = useCallback(async (postId: string) => {
    try {
      await hubRepo.adminDeletePost(postId);
      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId)
      );
      toast.success("Post removido");
    } catch (error) {
      const message = getErrorMessage(error, "Nao foi possivel remover o post.");
      logFrontendError("HubFeed.adminDelete", error, { postId });
      toast.error(message);
    }
  }, []);

  const setCommentDraft = useCallback((postId: string, text: string) => {
    setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [postId]: text }));
  }, []);

  return {
    posts: safePosts,
    errorMessage,
    loading,
    comments,
    openComments,
    commentDrafts,
    showParticles,
    setShowParticles,
    refresh: load,
    toggleReaction,
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
