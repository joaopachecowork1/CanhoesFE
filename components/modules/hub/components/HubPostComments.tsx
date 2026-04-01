"use client";

import type { HubCommentDto } from "@/lib/api/types";
import { feedCopy } from "@/lib/canhoesCopy";

import { CommentThread, type CommentType } from "@/components/ui/reddit-nested-thread-reply";

import { formatDateTime } from "./hubUtils";

type HubPostCommentsProps = {
  postId: string;
  postAuthorName: string;
  comments: HubCommentDto[];
  commentCount: number;
  openComments: boolean;
  commentDraft: string;
  showComposer: boolean;
  currentUserName: string;
  currentUserImage?: string | null;
  onToggleComments: (postId: string) => void;
  onAddComment: (postId: string) => void;
  onCommentDraftChange: (postId: string, text: string) => void;
  onToggleCommentReaction: (postId: string, commentId: string, emoji: string) => void;
};

const PREVIEW_COMMENT_COUNT = 2;

function toThreadComment(
  comment: HubCommentDto,
  currentUserName: string,
  currentUserImage: string | null | undefined,
  postAuthorName: string
): CommentType {
  return {
    id: comment.id,
    author: comment.userName,
    content: comment.text,
    timestamp: formatDateTime(comment.createdAtUtc),
    avatarSrc:
      comment.userName === currentUserName ? (currentUserImage ?? null) : null,
    reactionCounts: comment.reactionCounts ?? {},
    myReactions: comment.myReactions ?? [],
    replies: [],
    isOp: comment.userName === postAuthorName,
    persisted: true,
  };
}

export function HubPostComments({
  postId,
  postAuthorName,
  comments,
  commentCount,
  openComments,
  commentDraft,
  showComposer,
  currentUserName,
  currentUserImage,
  onToggleComments,
  onAddComment,
  onCommentDraftChange,
  onToggleCommentReaction,
}: Readonly<HubPostCommentsProps>) {
  const threadedComments = comments.map((comment) =>
    toThreadComment(comment, currentUserName, currentUserImage, postAuthorName)
  );

  return (
    <CommentThread
      initialComments={threadedComments}
      previewCount={PREVIEW_COMMENT_COUNT}
      totalCount={commentCount}
      expanded={openComments}
      showComposer={showComposer}
      onToggleExpanded={() => onToggleComments(postId)}
      draft={commentDraft}
      onDraftChange={(text) => onCommentDraftChange(postId, text)}
      onSubmit={() => onAddComment(postId)}
      currentUserName={currentUserName}
      currentUserImage={currentUserImage}
      composerPlaceholder={feedCopy.comments.placeholder}
      composerSubmitLabel={feedCopy.comments.submit}
      emptyStateLabel={feedCopy.comments.empty}
      onToggleReaction={(commentId, emoji) =>
        onToggleCommentReaction(postId, commentId, emoji)
      }
    />
  );
}
