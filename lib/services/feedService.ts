import { prisma } from "@/lib/prisma";
import type {
  EventFeedPostFullDto,
  EventFeedPollDto,
  HubCommentDto,
  PagedResult,
} from "@/lib/api/types";

type PostRow = {
  id: string;
  eventId: string;
  authorUserId: string;
  text: string;
  mediaUrl: string | null;
  mediaUrlsJson: unknown;
  isPinned: boolean;
  createdAtUtc: Date;
};

async function fetchPollForPost(postId: string, userId: string): Promise<EventFeedPollDto | null> {
  const poll = await prisma.hubPostPoll.findUnique({
    where: { postId },
    include: { options: true },
  });
  if (!poll) return null;

  const optionIds = poll.options.map((o) => o.id);
  const votes = optionIds.length > 0
    ? await prisma.hubPostPollVote.findMany({ where: { optionId: { in: optionIds } } })
    : [];

  const votesByOption = new Map<string, typeof votes>();
  for (const v of votes) {
    const arr = votesByOption.get(v.optionId) ?? [];
    arr.push(v);
    votesByOption.set(v.optionId, arr);
  }

  const totalVotes = votes.length;
  const myVote = votes.find((v) => v.userId === userId);

  return {
    question: poll.question,
    totalVotes,
    myOptionId: myVote?.optionId ?? null,
    options: poll.options.map((o) => ({
      id: o.id,
      text: o.text,
      voteCount: votesByOption.get(o.id)?.length ?? 0,
    })),
  };
}

async function fetchReactions(postId: string, userId: string) {
  const reactions = await prisma.hubPostReaction.findMany({
    where: { postId },
    select: { userId: true, emoji: true },
  });

  const reactionCounts: Record<string, number> = {};
  const myReactions: string[] = [];
  for (const r of reactions) {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] ?? 0) + 1;
    if (r.userId === userId) myReactions.push(r.emoji);
  }

  return { reactionCounts, myReactions, likedByMe: reactions.some((r) => r.userId === userId && r.emoji === "heart") };
}

async function enrichPost(post: PostRow, userId: string): Promise<EventFeedPostFullDto> {
  const author = await prisma.user.findUnique({
    where: { id: post.authorUserId },
    select: { displayName: true },
  });

  const [downvotes, commentCount, likeCount, poll, { reactionCounts, myReactions, likedByMe }] = await Promise.all([
    prisma.hubPostDownvote.count({ where: { postId: post.id } }),
    prisma.hubPostComment.count({ where: { postId: post.id } }),
    prisma.hubPostReaction.count({ where: { postId: post.id, emoji: "heart" } }),
    fetchPollForPost(post.id, userId),
    fetchReactions(post.id, userId),
  ]);

  const downvotedByMe = await prisma.hubPostDownvote
    .count({ where: { postId: post.id, userId } })
    .then((c) => c > 0);

  return {
    id: post.id,
    eventId: post.eventId,
    authorUserId: post.authorUserId,
    authorName: author?.displayName ?? "Unknown",
    text: post.text,
    mediaUrl: post.mediaUrl,
    mediaUrls: Array.isArray(post.mediaUrlsJson) ? post.mediaUrlsJson as string[] : [],
    isPinned: post.isPinned,
    createdAtUtc: post.createdAtUtc.toISOString(),
    likeCount,
    commentCount,
    downvoteCount: downvotes,
    reactionCounts,
    myReactions,
    likedByMe,
    downvotedByMe,
    poll,
  };
}

export async function getFeedPosts(
  eventId: string,
  userId: string,
  skip = 0,
  take = 15
): Promise<PagedResult<EventFeedPostFullDto>> {
  const where = { eventId };
  const [total, rows] = await Promise.all([
    prisma.hubPost.count({ where }),
    prisma.hubPost.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAtUtc: "desc" }],
      skip,
      take,
      select: {
        id: true, eventId: true, authorUserId: true, text: true,
        mediaUrl: true, mediaUrlsJson: true, isPinned: true, createdAtUtc: true,
      },
    }),
  ]);

  const items = await Promise.all(rows.map((r) => enrichPost(r, userId)));

  return { items, total, skip, take, hasMore: skip + take < total };
}

export async function createFeedPost(
  eventId: string,
  userId: string,
  data: {
    text: string;
    mediaUrl?: string | null;
    mediaUrls?: string[] | null;
    pollQuestion?: string | null;
    pollOptions?: string[] | null;
  }
): Promise<EventFeedPostFullDto> {
  const post = await prisma.$transaction(async (tx) => {
    const p = await tx.hubPost.create({
      data: {
        eventId,
        authorUserId: userId,
        text: data.text.trim(),
        mediaUrl: data.mediaUrl ?? null,
        mediaUrlsJson: data.mediaUrls ?? [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma Json field
      } as any,
    });

    if (data.pollQuestion) {
      await tx.hubPostPoll.create({
        data: {
          postId: p.id,
          question: data.pollQuestion.trim(),
          options: {
            create: (data.pollOptions ?? []).map((opt, i) => ({
              text: opt.trim(),
              sortOrder: i,
            })),
          },
        },
      });
    }

    return p;
  });

  return enrichPost(post, userId);
}

export async function toggleLike(
  _eventId: string,
  postId: string,
  userId: string
): Promise<void> {
  const existing = await prisma.hubPostReaction.findFirst({
    where: { postId, userId, emoji: "heart" },
  });

  if (existing) {
    await prisma.hubPostReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.hubPostDownvote.deleteMany({ where: { postId, userId } });
    await prisma.hubPostReaction.create({
      data: { postId, userId, emoji: "heart" },
    });
  }
}

export async function toggleDownvote(
  _eventId: string,
  postId: string,
  userId: string
): Promise<void> {
  const existing = await prisma.hubPostDownvote.findFirst({
    where: { postId, userId },
  });

  if (existing) {
    await prisma.hubPostDownvote.delete({ where: { id: existing.id } });
  } else {
    await prisma.hubPostReaction.deleteMany({ where: { postId, userId, emoji: "heart" } });
    await prisma.hubPostDownvote.create({
      data: { postId, userId },
    });
  }
}

export async function toggleReaction(
  _eventId: string,
  postId: string,
  userId: string,
  emoji: string
): Promise<void> {
  const existing = await prisma.hubPostReaction.findFirst({
    where: { postId, userId, emoji },
  });

  if (existing) {
    await prisma.hubPostReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.hubPostReaction.create({
      data: { postId, userId, emoji },
    });
  }
}

export async function getPostComments(
  _eventId: string,
  postId: string,
  userId: string
): Promise<HubCommentDto[]> {
  const comments = await prisma.hubPostComment.findMany({
    where: { postId },
    orderBy: { createdAtUtc: "asc" },
    include: {
      reactions: { select: { userId: true, emoji: true } },
    },
  });

  const commentUserIds = [...new Set(comments.map((c) => c.userId))];
  const commentUsers = commentUserIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: commentUserIds } }, select: { id: true, displayName: true } })
    : [];
  const commentUserMap = new Map(commentUsers.map((u) => [u.id, u.displayName]));

  return comments.map((c) => {
    const reactionCounts: Record<string, number> = {};
    const myReactions: string[] = [];
    for (const r of c.reactions) {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] ?? 0) + 1;
      if (r.userId === userId) myReactions.push(r.emoji);
    }

    return {
      id: c.id,
      postId: c.postId,
      userId: c.userId,
      userName: commentUserMap.get(c.userId) ?? "Unknown",
      text: c.text,
      createdAtUtc: c.createdAtUtc.toISOString(),
      reactionCounts,
      myReactions,
    };
  });
}

export async function createComment(
  _eventId: string,
  postId: string,
  userId: string,
  text: string
): Promise<HubCommentDto> {
  const comment = await prisma.hubPostComment.create({
    data: { postId, userId, text: text.trim() },
    include: {
      reactions: { select: { userId: true, emoji: true } },
    },
  });

  const commentAuthor = await prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true },
  });

  return {
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    userName: commentAuthor?.displayName ?? "Unknown",
    text: comment.text,
    createdAtUtc: comment.createdAtUtc.toISOString(),
    reactionCounts: {},
    myReactions: [],
  };
}

export async function deleteComment(
  _eventId: string,
  postId: string,
  commentId: string,
  userId: string,
  isAdmin: boolean
): Promise<boolean> {
  const comment = await prisma.hubPostComment.findFirst({
    where: { id: commentId, postId },
  });

  if (!comment) return false;
  if (comment.userId !== userId && !isAdmin) return false;

  await prisma.hubPostComment.delete({ where: { id: commentId } });
  return true;
}

export async function toggleCommentReaction(
  _eventId: string,
  _postId: string,
  commentId: string,
  userId: string,
  emoji: string
): Promise<void> {
  const existing = await prisma.hubPostCommentReaction.findFirst({
    where: { commentId, userId, emoji },
  });

  if (existing) {
    await prisma.hubPostCommentReaction.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.hubPostCommentReaction.create({
      data: { commentId, userId, emoji },
    });
  }
}

export async function votePoll(
  _eventId: string,
  postId: string,
  userId: string,
  optionId: string
): Promise<void> {
  const existing = await prisma.hubPostPollVote.findFirst({
    where: { postId, userId },
  });

  if (existing) {
    if (existing.optionId === optionId) {
      await prisma.hubPostPollVote.delete({ where: { id: existing.id } });
    } else {
      await prisma.hubPostPollVote.update({
        where: { id: existing.id },
        data: { optionId },
      });
    }
  } else {
    await prisma.hubPostPollVote.create({
      data: { postId, userId, optionId },
    });
  }
}

export async function togglePin(
  eventId: string,
  postId: string
): Promise<boolean> {
  const post = await prisma.hubPost.findFirst({
    where: { id: postId, eventId },
  });
  if (!post) return false;

  await prisma.hubPost.update({
    where: { id: postId },
    data: { isPinned: !post.isPinned },
  });
  return true;
}

export async function deleteFeedPost(
  eventId: string,
  postId: string
): Promise<boolean> {
  const post = await prisma.hubPost.findFirst({
    where: { id: postId, eventId },
  });
  if (!post) return false;

  await prisma.hubPost.delete({ where: { id: postId } });
  return true;
}
