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

  getAdminBootstrap: (eventId: string) =>
    canhoesFetch<T.EventAdminBootstrapDto>(`/v1/events/${eventId}/admin/bootstrap`),

  updateAdminState: (eventId: string, payload: T.UpdateEventAdminStateRequest) =>
    canhoesFetch<T.EventAdminStateDto>(`/v1/events/${eventId}/admin/state`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  updateEventModules: (eventId: string, payload: T.UpdateEventModulesRequest) =>
    canhoesFetch<T.EventOverviewDto>(`/v1/events/${eventId}/modules`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  updateAdminPhase: (eventId: string, payload: T.UpdateEventPhaseRequest) =>
    canhoesFetch<T.EventAdminStateDto>(`/v1/events/${eventId}/admin/phase`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  adminGetSecretSantaState: (eventId: string) =>
    canhoesFetch<T.EventAdminSecretSantaStateDto>(`/v1/events/${eventId}/admin/secret-santa/state`),

  adminDrawSecretSanta: (eventId: string, payload: T.CreateEventSecretSantaDrawRequest) =>
    canhoesFetch<T.EventAdminSecretSantaStateDto>(`/v1/events/${eventId}/admin/secret-santa/draw`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  adminActivateEvent: (eventId: string) =>
    canhoesFetch<T.EventSummaryDto>(`/v1/events/${eventId}/admin/activate`, {
      method: "PUT",
    }),

  adminGetMembers: (eventId: string) =>
    canhoesFetch<T.PublicUserDto[]>(`/v1/events/${eventId}/admin/members`),

  adminVotes: (eventId: string) =>
    canhoesFetch<T.AdminVotesDto>(`/v1/events/${eventId}/admin/votes`),

  adminGetCategoryProposals: (eventId: string, status?: "pending" | "approved" | "rejected") =>
    canhoesFetch<T.CategoryProposalDto[]>(
      `/v1/events/${eventId}/admin/category-proposals${status ? `?status=${encodeURIComponent(status)}` : ""}`
    ),

  adminUpdateCategoryProposal: (
    eventId: string,
    proposalId: string,
    payload: T.UpdateAdminCategoryProposalRequest
  ) =>
    canhoesFetch<T.CategoryProposalDto>(
      `/v1/events/${eventId}/admin/category-proposals/${proposalId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    ),

  adminDeleteCategoryProposal: (eventId: string, proposalId: string) =>
    canhoesFetch<void>(`/v1/events/${eventId}/admin/category-proposals/${proposalId}`, {
      method: "DELETE",
    }),

  adminProposalsHistory: (eventId: string) =>
    canhoesFetch<T.AdminProposalsHistoryDto>(`/v1/events/${eventId}/admin/proposals`),

  adminGetMeasureProposals: (eventId: string, status?: "pending" | "approved" | "rejected") =>
    canhoesFetch<T.MeasureProposalDto[]>(
      `/v1/events/${eventId}/admin/measure-proposals${status ? `?status=${encodeURIComponent(status)}` : ""}`
    ),

  adminUpdateMeasureProposal: (
    eventId: string,
    proposalId: string,
    payload: T.UpdateMeasureProposalRequest
  ) =>
    canhoesFetch<T.MeasureProposalDto>(
      `/v1/events/${eventId}/admin/measure-proposals/${proposalId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    ),

  adminDeleteMeasureProposal: (eventId: string, proposalId: string) =>
    canhoesFetch<void>(`/v1/events/${eventId}/admin/measure-proposals/${proposalId}`, {
      method: "DELETE",
    }),

  adminApproveMeasureProposal: (eventId: string, proposalId: string) =>
    canhoesFetch<T.GalaMeasureDto>(`/v1/events/${eventId}/admin/measure-proposals/${proposalId}/approve`, {
      method: "POST",
    }),

  adminRejectMeasureProposal: (eventId: string, proposalId: string) =>
    canhoesFetch<T.MeasureProposalDto>(`/v1/events/${eventId}/admin/measure-proposals/${proposalId}/reject`, {
      method: "POST",
    }),

  adminGetNominees: (eventId: string, status?: "pending" | "approved" | "rejected") =>
    canhoesFetch<T.NomineeDto[]>(
      `/v1/events/${eventId}/admin/nominees${status ? `?status=${encodeURIComponent(status)}` : ""}`
    ),

  adminSetNomineeCategory: (
    eventId: string,
    nomineeId: string,
    payload: T.SetNomineeCategoryRequest
  ) =>
    canhoesFetch<T.NomineeDto>(`/v1/events/${eventId}/admin/nominees/${nomineeId}/set-category`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  adminApproveNominee: (eventId: string, nomineeId: string) =>
    canhoesFetch<T.NomineeDto>(`/v1/events/${eventId}/admin/nominees/${nomineeId}/approve`, {
      method: "POST",
    }),

  adminRejectNominee: (eventId: string, nomineeId: string) =>
    canhoesFetch<T.NomineeDto>(`/v1/events/${eventId}/admin/nominees/${nomineeId}/reject`, {
      method: "POST",
    }),

  getMyNominationStatus: (eventId: string) =>
    canhoesFetch<T.MyNominationStatusDto[]>(`/v1/events/${eventId}/nominations/my-status`),

  createNomination: (eventId: string, payload: T.CreateNomineeRequest) =>
    canhoesFetch<T.NomineeDto>(`/v1/events/${eventId}/nominations`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getApprovedNominees: (eventId: string, categoryId?: string) =>
    canhoesFetch<T.NomineeDto[]>(
      `/v1/events/${eventId}/nominations/approved${
        categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ""
      }`
    ),

  getVotingBoard: (eventId: string) =>
    canhoesFetch<T.EventVotingBoardDto>(`/v1/events/${eventId}/voting`),

  castVote: (eventId: string, payload: T.CreateEventVoteRequest) =>
    canhoesFetch<T.EventVoteDto>(`/v1/events/${eventId}/votes`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getOfficialVotingBoard: (eventId: string) =>
    canhoesFetch<T.OfficialVotingBoardDto>(`/v1/events/${eventId}/official-voting`),

  castOfficialVote: (eventId: string, payload: T.CastOfficialVoteRequest) =>
    canhoesFetch<T.OfficialVoteDto>(`/v1/events/${eventId}/official-votes`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  adminGetNominationsWithAuthors: (
    eventId: string,
    status?: "pending" | "approved" | "rejected"
  ) =>
    canhoesFetch<T.AdminNomineeDto[]>(
      `/v1/events/${eventId}/admin/nominations${
        status ? `?status=${encodeURIComponent(status)}` : ""
      }`
    ),

  adminApproveNomination: (eventId: string, nomineeId: string) =>
    canhoesFetch<T.AdminNomineeDto>(
      `/v1/events/${eventId}/admin/nominations/${nomineeId}/approve`,
      {
        method: "POST",
      }
    ),

  adminRejectNomination: (eventId: string, nomineeId: string) =>
    canhoesFetch<T.AdminNomineeDto>(
      `/v1/events/${eventId}/admin/nominations/${nomineeId}/reject`,
      {
        method: "POST",
      }
    ),

  adminSetNominationCategory: (
    eventId: string,
    nomineeId: string,
    payload: T.SetNomineeCategoryRequest
  ) =>
    canhoesFetch<T.AdminNomineeDto>(
      `/v1/events/${eventId}/admin/nominations/${nomineeId}/set-category`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  adminGetOfficialResults: (eventId: string) =>
    canhoesFetch<T.AdminOfficialResultsDto>(`/v1/events/${eventId}/admin/official-results`),

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
