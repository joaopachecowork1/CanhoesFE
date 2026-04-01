"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { HubCommentDto, HubPostDto } from "@/lib/api/types";
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

  const reactionCounts = { ...(post.reactionCounts ?? {}) };
  reactionCounts[emoji] = Math.max(
    0,
    (reactionCounts[emoji] ?? 0) + (wasActive ? -1 : 1)
  );

  const nextLikeCount =
    emoji === HEART_REACTION
      ? Math.max(0, (post.likeCount ?? 0) + (wasActive ? -1 : 1))
      : (post.likeCount ?? 0);

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

  const reactionCounts = { ...(comment.reactionCounts ?? {}) };
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
    try {
      const data = await hubRepo.getPosts(50);
      setPosts(sanitizePosts(data));
    } catch {
      toast.error("Erro ao carregar o feed");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handlePostCreated = (event: Event) => {
      const createdPost = (event as CustomEvent<HubPostDto | undefined>).detail;
      if (!createdPost?.id) return;

      setPosts((currentPosts) => [
        createdPost,
        ...currentPosts.filter((post) => post.id !== createdPost.id),
      ]);
    };

    window.addEventListener("hub:postCreated", handlePostCreated);
    return () =>
      window.removeEventListener("hub:postCreated", handlePostCreated);
  }, []);

  useEffect(() => {
    const postIdsNeedingPreview = safePosts
      .filter(
        (post) =>
          (post.commentCount ?? 0) > 0 && typeof comments[post.id] === "undefined"
      )
      .map((post) => post.id);

    if (postIdsNeedingPreview.length === 0) return;

    let cancelled = false;

    void Promise.allSettled(
      postIdsNeedingPreview.map(async (postId) => {
        try {
          const list = await hubRepo.getComments(postId);
          if (cancelled) return;

          setComments((currentComments) =>
            typeof currentComments[postId] !== "undefined"
              ? currentComments
              : {
                  ...currentComments,
                  [postId]: (list ?? []).filter(Boolean),
                }
          );
        } catch {
          // Inline previews fail silently; the post should still render.
        }
      })
    );

    return () => {
      cancelled = true;
    };
  }, [comments, safePosts]);

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
      } catch {
        toast.error("Erro ao atualizar reacao");
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
      } catch {
        toast.error("Erro ao votar");
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
      } catch {
        toast.error("Erro ao carregar comentarios");
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
      } catch {
        toast.error("Erro ao comentar");
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
      } catch {
        toast.error("Erro ao atualizar reacao do comentario");
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
    } catch {
      toast.error("Erro ao fixar post");
    }
  }, []);

  const adminDelete = useCallback(async (postId: string) => {
    try {
      await hubRepo.adminDeletePost(postId);
      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId)
      );
      toast.success("Post removido");
    } catch {
      toast.error("Erro ao remover post");
    }
  }, []);

  const setCommentDraft = useCallback((postId: string, text: string) => {
    setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [postId]: text }));
  }, []);

  return {
    posts: safePosts,
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
    toggleCommentReaction,
    adminPin,
    adminDelete,
    setCommentDraft,
  };
}
