import { canhoesFetch } from "@/lib/api/canhoesClient";
import type * as T from "@/lib/api/types";

export const canhoesEventsRepo = {
  listEvents: () => canhoesFetch<T.EventSummaryDto[]>("/v1/events"),

  getEventContext: (eventId: string) =>
    canhoesFetch<T.EventContextDto>(`/v1/events/${eventId}`),

  getEventOverview: (eventId: string) =>
    canhoesFetch<T.EventOverviewDto>(`/v1/events/${eventId}/overview`),

  getVotingOverview: (eventId: string) =>
    canhoesFetch<T.EventVotingOverviewDto>(`/v1/events/${eventId}/voting/overview`),

  getSecretSantaOverview: (eventId: string) =>
    canhoesFetch<T.EventSecretSantaOverviewDto>(`/v1/events/${eventId}/secret-santa/overview`),

  getFeedPosts: (eventId: string) =>
    canhoesFetch<T.EventFeedPostDto[]>(`/v1/events/${eventId}/feed/posts`),

  createFeedPost: (eventId: string, payload: T.CreateEventPostRequest) =>
    canhoesFetch<T.EventFeedPostDto>(`/v1/events/${eventId}/feed/posts`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getCategories: (eventId: string) =>
    canhoesFetch<T.EventCategoryDto[]>(`/v1/events/${eventId}/categories`),

  createCategory: (eventId: string, payload: T.CreateEventCategoryRequest) =>
    canhoesFetch<T.EventCategoryDto>(`/v1/events/${eventId}/categories`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  adminGetCategories: (eventId: string) =>
    canhoesFetch<T.AwardCategoryDto[]>(`/v1/events/${eventId}/admin/categories`),

  adminCreateCategory: (eventId: string, payload: T.CreateAwardCategoryRequest) =>
    canhoesFetch<T.AwardCategoryDto>(`/v1/events/${eventId}/admin/categories`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  adminUpdateCategory: (
    eventId: string,
    categoryId: string,
    payload: T.UpdateAwardCategoryRequest
  ) =>
    canhoesFetch<T.AwardCategoryDto>(`/v1/events/${eventId}/admin/categories/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  adminDeleteCategory: (eventId: string, categoryId: string) =>
    canhoesFetch<void>(`/v1/events/${eventId}/admin/categories/${categoryId}`, {
      method: "DELETE",
    }),

  getAdminState: (eventId: string) =>
    canhoesFetch<T.EventAdminStateDto>(`/v1/events/${eventId}/admin/state`),

  updateAdminState: (eventId: string, payload: T.UpdateEventAdminStateRequest) =>
    canhoesFetch<T.EventAdminStateDto>(`/v1/events/${eventId}/admin/state`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  updateAdminPhase: (eventId: string, payload: T.UpdateEventPhaseRequest) =>
    canhoesFetch<T.EventAdminStateDto>(`/v1/events/${eventId}/admin/phase`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  getVotingBoard: (eventId: string) =>
    canhoesFetch<T.EventVotingBoardDto>(`/v1/events/${eventId}/voting`),

  castVote: (eventId: string, payload: T.CreateEventVoteRequest) =>
    canhoesFetch<T.EventVoteDto>(`/v1/events/${eventId}/votes`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getProposals: (eventId: string) =>
    canhoesFetch<T.EventProposalDto[]>(`/v1/events/${eventId}/proposals`),

  createProposal: (eventId: string, payload: T.CreateEventProposalRequest) =>
    canhoesFetch<T.EventProposalDto>(`/v1/events/${eventId}/proposals`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateProposal: (eventId: string, proposalId: string, payload: T.UpdateEventProposalRequest) =>
    canhoesFetch<T.EventProposalDto>(`/v1/events/${eventId}/proposals/${proposalId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  getWishlist: (eventId: string) =>
    canhoesFetch<T.EventWishlistItemDto[]>(`/v1/events/${eventId}/wishlist`),

  createWishlistItem: (eventId: string, payload: T.CreateEventWishlistItemRequest) =>
    canhoesFetch<T.EventWishlistItemDto>(`/v1/events/${eventId}/wishlist`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export default canhoesEventsRepo;
