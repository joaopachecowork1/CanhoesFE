"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage, logFrontendError } from "@/lib/errors";
import type { EventFeedPostFullDto } from "@/lib/api/types";
import { feedRepo } from "@/lib/repositories/feedRepo";

import type { PostComposerSubmitData } from "./components/PostComposer";

type UseCreateFeedPostParams = {
  eventId: string | null;
};

type FeedInfiniteData = {
  pages: Array<{ posts: EventFeedPostFullDto[]; nextCursor: number | null }>;
  pageParams: number[];
};

function prependCreatedPost(old: FeedInfiniteData | undefined, createdPost: EventFeedPostFullDto) {
  if (!old?.pages?.length) return old;

  const [firstPage, ...restPages] = old.pages;
  return {
    ...old,
    pages: [
      {
        ...firstPage,
        posts: [createdPost, ...firstPage.posts.filter((post) => post.id !== createdPost.id)],
      },
      ...restPages,
    ],
  };
}

export function useCreateFeedPost({ eventId }: Readonly<UseCreateFeedPostParams>) {
  const queryClient = useQueryClient();

  return useCallback(async (data: PostComposerSubmitData) => {
    if (!eventId) {
      toast.error("Não há evento ativo para publicar no mural.");
      return;
    }

    const trimmedText = data.text.trim();
    if (!trimmedText) return;

    try {
      let mediaUrls: string[] = [];

      if (data.files.length > 0) {
        mediaUrls = await feedRepo.uploadFeedImages(eventId, data.files);
      }

      const pollQuestion = data.pollOn ? data.pollQuestion.trim() : "";
      const pollOptions = data.pollOn
        ? data.pollOptions.map((option) => option.trim()).filter(Boolean)
        : [];

      const createdPost = await feedRepo.createPost(eventId, {
        content: trimmedText,
        mediaUrls,
        pollQuestion: data.pollOn && pollQuestion ? pollQuestion : null,
        pollOptions: data.pollOn ? pollOptions : null,
      });

      if (createdPost?.id) {
        queryClient.setQueryData<FeedInfiniteData>(["hub-posts", eventId], (old) =>
          prependCreatedPost(old, createdPost)
        );
      }

      toast.success("Post publicado");
    } catch (error) {
      const message = getErrorMessage(error, "Não foi possível publicar no mural.");
      logFrontendError("HubFeedModule.createPost", error);
      toast.error(message);
      throw error;
    }
  }, [eventId, queryClient]);
}
