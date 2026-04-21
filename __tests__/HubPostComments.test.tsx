import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { HubPostComments } from "@/components/modules/hub/components/HubPostComments";

vi.mock("@/components/ui/virtualized-list", () => ({
  VirtualizedList: ({
    items,
    renderItem,
  }: {
    items: readonly unknown[];
    renderItem: (item: unknown, index: number) => React.ReactNode;
  }) => <div>{items.map((item, index) => <React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>)}</div>,
}));

const onToggleCommentReaction = vi.fn();
const onDeleteComment = vi.fn();
const onAddComment = vi.fn();
const onCommentDraftChange = vi.fn();
const onToggleComments = vi.fn();

function renderComments(overrides: Partial<React.ComponentProps<typeof HubPostComments>> = {}) {
  return render(
    <HubPostComments
      postId="post-1"
      postAuthorName="Ana"
      comments={[
        {
          id: "comment-1",
          userId: "user-1",
          userName: "Joao",
          authorName: "Joao",
          text: "Boa ideia",
          createdAtUtc: "2026-04-21T21:00:00Z",
          reactionCounts: { "❤️": 1 },
          myReactions: [],
        },
      ]}
      commentCount={1}
      openComments
      commentDraft=""
      currentUserId="user-1"
      currentUserName="Joao"
      currentUserImage={null}
      onToggleComments={onToggleComments}
      onAddComment={onAddComment}
      onDeleteComment={onDeleteComment}
      onCommentDraftChange={onCommentDraftChange}
      onToggleCommentReaction={onToggleCommentReaction}
      {...overrides}
    />
  );
}

describe("HubPostComments", () => {
  it("toggla uma reação e confirma a remoção de um comentário", () => {
    renderComments();

    fireEvent.click(screen.getByRole("button", { name: /❤️/ }));
    expect(onToggleCommentReaction).toHaveBeenCalledWith("post-1", "comment-1", "❤️");

    fireEvent.click(screen.getByRole("button", { name: /Apagar comentário/i }));
    expect(screen.getByText(/Apagar comentario\?/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /^Apagar$/i }));
    expect(onDeleteComment).toHaveBeenCalledWith("post-1", "comment-1");
  });

  it("mostra o estado vazio quando nao ha comentarios", () => {
    renderComments({ comments: [], commentCount: 0 });

    expect(screen.getByText(/Sem comentários ainda/i)).toBeTruthy();
    expect(screen.getByText(/Este registo ainda nao tem respostas/i)).toBeTruthy();
  });
});
