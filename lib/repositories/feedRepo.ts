import { canhoesFetch } from "@/lib/api/canhoesClient";
import type * as T from "@/lib/api/types";

function toFormData(files: File[]) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  return formData;
}

export const feedRepo = {
  getPosts: (eventId: string, params: { skip: number; take: number }) =>
    canhoesFetch<T.PagedResult<T.EventFeedPostFullDto>>(`/v1/events/${eventId}/feed/posts?skip=${params.skip}&take=${params.take}`),
    
  createPost: (eventId: string, payload: T.CreateEventFeedPostRequest) =>
    canhoesFetch<T.EventFeedPostFullDto>(`/v1/events/${eventId}/feed/posts`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    
  getComments: (eventId: string, postId: string) =>
    canhoesFetch<T.HubCommentDto[]>(`/v1/events/${eventId}/feed/posts/${postId}/comments`),
    
  createComment: (eventId: string, postId: string, payload: { text: string }) =>
    canhoesFetch<T.HubCommentDto>(`/v1/events/${eventId}/feed/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    
  deleteComment: (eventId: string, postId: string, commentId: string) =>
    canhoesFetch<void>(`/v1/events/${eventId}/feed/posts/${postId}/comments/${commentId}`, { method: "DELETE" }),
    
  togglePostLike: (eventId: string, postId: string) =>
    canhoesFetch<{ liked: boolean }>(`/v1/events/${eventId}/feed/posts/${postId}/like`, { method: "POST" }),
    
  togglePostDownvote: (eventId: string, postId: string) =>
    canhoesFetch<{ downvoted: boolean }>(`/v1/events/${eventId}/feed/posts/${postId}/downvote`, { method: "POST" }),
    
  togglePostReaction: (eventId: string, postId: string, emoji: string) =>
    canhoesFetch(`/v1/events/${eventId}/feed/posts/${postId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    }),
    
  toggleCommentReaction: (eventId: string, postId: string, commentId: string, emoji: string) =>
    canhoesFetch(`/v1/events/${eventId}/feed/posts/${postId}/comments/${commentId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    }),
    
  votePoll: (eventId: string, postId: string, optionId: string) =>
    canhoesFetch<void>(`/v1/events/${eventId}/feed/posts/${postId}/poll/vote`, {
      method: "POST",
      body: JSON.stringify({ optionId }),
    }),
    
  uploadFeedImages: (eventId: string, files: File[]) =>
    canhoesFetch<string[]>(`/v1/events/${eventId}/feed/uploads`, {
      method: "POST",
      body: toFormData(files),
      canhoes: { skipDeduplication: true },
    }),

  adminPinPost: (eventId: string, postId: string) =>
    canhoesFetch<{ pinned: boolean }>(`/v1/events/${eventId}/feed/posts/${postId}/pin`, { method: "POST" }),
    
  adminDeletePost: (eventId: string, postId: string) =>
    canhoesFetch<void>(`/v1/events/${eventId}/feed/posts/${postId}`, { method: "DELETE" }),
};
