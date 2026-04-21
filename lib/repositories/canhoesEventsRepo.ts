import { canhoesFetch } from "@/lib/api/canhoesClient";
import type * as T from "@/lib/api/types";

function toFormData(files: File[]) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  return formData;
}

export const canhoesEventsRepo = {
  getActiveContext: () => canhoesFetch<T.EventActiveContextDto>("/v1/events/active/context"),
  getAdminBootstrap: (eventId: string, includeLists = false) =>
    canhoesFetch<T.EventAdminBootstrapDto>(`/v1/events/${eventId}/admin/bootstrap?includeLists=${includeLists}`),
  getEventHomeSnapshot: (eventId: string) => canhoesFetch<T.EventHomeSnapshotDto>(`/v1/events/${eventId}/home-snapshot`),
  getFeedPosts: (eventId: string, params: { skip: number; take: number }) =>
    canhoesFetch(`/v1/events/${eventId}/feed/posts?skip=${params.skip}&take=${params.take}`),
  getFeedPostComments: (eventId: string, postId: string) =>
    canhoesFetch<T.HubCommentDto[]>(`/v1/events/${eventId}/feed/posts/${postId}/comments`),
  createFeedPostComment: (eventId: string, postId: string, payload: { text: string }) =>
    canhoesFetch<T.HubCommentDto>(`/v1/events/${eventId}/feed/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  toggleFeedPostLike: (eventId: string, postId: string) =>
    canhoesFetch(`/v1/events/${eventId}/feed/posts/${postId}/like`, { method: "POST" }),
  toggleFeedPostReaction: (eventId: string, postId: string, emoji: string) =>
    canhoesFetch(`/v1/events/${eventId}/feed/posts/${postId}/reactions/${encodeURIComponent(emoji)}`, { method: "POST" }),
  toggleFeedPostDownvote: (eventId: string, postId: string) =>
    canhoesFetch<{ downvoted: boolean }>(`/v1/events/${eventId}/feed/posts/${postId}/downvote`, { method: "POST" }),
  voteFeedPoll: (eventId: string, postId: string, optionId: string) =>
    canhoesFetch<void>(`/v1/events/${eventId}/feed/posts/${postId}/poll/${optionId}`, { method: "POST" }),
  toggleFeedCommentReaction: (eventId: string, postId: string, commentId: string, emoji: string) =>
    canhoesFetch(`/v1/events/${eventId}/feed/posts/${postId}/comments/${commentId}/reactions/${encodeURIComponent(emoji)}`, { method: "POST" }),
  deleteFeedPostComment: (eventId: string, postId: string, commentId: string) =>
    canhoesFetch<void>(`/v1/events/${eventId}/feed/posts/${postId}/comments/${commentId}`, { method: "DELETE" }),
  adminPinFeedPost: (eventId: string, postId: string) =>
    canhoesFetch<{ pinned: boolean }>(`/v1/events/${eventId}/admin/feed/posts/${postId}/pin`, { method: "POST" }),
  adminDeleteFeedPost: (eventId: string, postId: string) =>
    canhoesFetch(`/v1/events/${eventId}/admin/feed/posts/${postId}`, { method: "DELETE" }),
  uploadFeedImage: (eventId: string, files: File[]) =>
    canhoesFetch<string[]>(`/v1/events/${eventId}/feed/uploads`, {
      method: "POST",
      body: toFormData(files),
      canhoes: { skipDeduplication: true },
    }),
  uploadFeedImages: (eventId: string, files: File[]) =>
    canhoesFetch<string[]>(`/v1/events/${eventId}/feed/uploads`, {
      method: "POST",
      body: toFormData(files),
      canhoes: { skipDeduplication: true },
    }),
  createFeedPost: (eventId: string, payload: T.CreateEventFeedPostRequest) =>
    canhoesFetch<T.EventFeedPostFullDto>(`/v1/events/${eventId}/feed/posts`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getAdminNominationsSummary: (eventId: string, status = "pending") =>
    canhoesFetch<T.AdminNomineeDto[]>(`/v1/events/${eventId}/admin/nominees?status=${encodeURIComponent(status)}`),
  getAdminNominationsPaged: (eventId: string, skip = 0, take = 5) =>
    canhoesFetch<{ nominations: T.AdminNomineeDto[] }>(`/v1/events/${eventId}/admin/nominees?skip=${skip}&take=${take}`),
  loadAdminNominationsPage: (eventId: string, skip = 0, take = 50, status?: string) =>
    canhoesFetch<{ nominations: T.AdminNomineeDto[] }>(
      `/v1/events/${eventId}/admin/nominees?skip=${skip}&take=${take}${status ? `&status=${encodeURIComponent(status)}` : ""}`
    ),
  loadAllAdminVotes: (eventId: string) =>
    canhoesFetch<T.AdminVoteAuditRowDto[]>(`/v1/events/${eventId}/admin/votes/paged`),
  getAdminVotesPaged: (eventId: string, skip = 0, take = 50) =>
    canhoesFetch<T.AdminVoteAuditRowDto[]>(`/v1/events/${eventId}/admin/votes/paged?skip=${skip}&take=${take}`),
  loadAllAdminOfficialResults: (eventId: string) =>
    canhoesFetch<T.AdminCategoryResultDto[]>(`/v1/events/${eventId}/admin/official-results/paged`),
  getAdminOfficialResultsPaged: (eventId: string, skip = 0, take = 50) =>
    canhoesFetch<T.AdminCategoryResultDto[]>(`/v1/events/${eventId}/admin/official-results/paged?skip=${skip}&take=${take}`),
  getResults: (eventId: string) =>
    canhoesFetch<T.CanhoesCategoryResultDto[]>(`/v1/events/${eventId}/results`),
  getMeasures: (eventId: string) =>
    canhoesFetch<T.GalaMeasureDto[]>(`/v1/events/${eventId}/measures`),
  createMeasureProposal: (eventId: string, payload: { text: string }) =>
    canhoesFetch<T.MeasureProposalDto>(`/v1/events/${eventId}/measures/proposals`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  adminCreateCategory: (eventId: string, payload: T.CreateAwardCategoryRequest) =>
    canhoesFetch<T.AwardCategoryDto>(`/v1/events/${eventId}/admin/categories`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  adminUpdateCategory: (eventId: string, categoryId: string, payload: T.UpdateAwardCategoryRequest) =>
    canhoesFetch<T.AwardCategoryDto>(`/v1/events/${eventId}/admin/categories/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  adminDeleteCategory: (eventId: string, categoryId: string) =>
    canhoesFetch<void>(`/v1/events/${eventId}/admin/categories/${categoryId}`, {
      method: "DELETE",
    }),
  adminGetCategoryProposals: (eventId: string, status = "pending") =>
    canhoesFetch<T.CategoryProposalDto[]>(`/v1/events/${eventId}/admin/category-proposals?status=${encodeURIComponent(status)}`),
  adminUpdateCategoryProposal: (eventId: string, proposalId: string, payload: { description: string | null; name: string; status?: string }) =>
    canhoesFetch<T.CategoryProposalDto>(`/v1/events/${eventId}/admin/category-proposals/${proposalId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  adminDeleteCategoryProposal: (eventId: string, proposalId: string) =>
    canhoesFetch<void>(`/v1/events/${eventId}/admin/category-proposals/${proposalId}`, {
      method: "DELETE",
    }),
  adminGetMeasureProposals: (eventId: string, status = "pending") =>
    canhoesFetch<T.MeasureProposalDto[]>(`/v1/events/${eventId}/admin/measure-proposals?status=${encodeURIComponent(status)}`),
  adminUpdateMeasureProposal: (eventId: string, proposalId: string, payload: { text?: string | null; status?: string | null }) =>
    canhoesFetch<T.MeasureProposalDto>(`/v1/events/${eventId}/admin/measure-proposals/${proposalId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
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
  updateAdminPhase: (eventId: string, payload: { phaseType: string }) =>
    canhoesFetch(`/v1/events/${eventId}/admin/phase`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  adminActivateEvent: (eventIdToActivate: string) =>
    canhoesFetch(`/v1/events/${eventIdToActivate}/admin/activate`, {
      method: "PUT",
    }),
  updateAdminState: (eventId: string, payload: unknown) =>
    canhoesFetch(`/v1/events/${eventId}/admin/state`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  updateEventModules: (eventId: string, payload: unknown) =>
    canhoesFetch(`/v1/events/${eventId}/modules`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  loadAdminMembersPage: (eventId: string, skip = 0, take = 50) =>
    canhoesFetch<{ items: T.AdminMemberDto[] }>(`/v1/events/${eventId}/admin/members/paged?skip=${skip}&take=${take}`),
  adminGetSecretSantaState: (eventId: string) =>
    canhoesFetch<T.EventAdminSecretSantaStateDto>(`/v1/events/${eventId}/admin/secret-santa/state`),
  adminDrawSecretSanta: (eventId: string, payload?: unknown) =>
    canhoesFetch(`/v1/events/${eventId}/admin/secret-santa/draw`, {
      method: "POST",
      body: JSON.stringify(payload ?? {}),
    }),
  adminGetCategories: (eventId: string) =>
    canhoesFetch<T.AwardCategoryDto[]>(`/v1/events/${eventId}/admin/categories`),
  getCategories: (eventId: string) =>
    canhoesFetch<T.EventCategoryDto[]>(`/v1/events/${eventId}/categories`),
  getUserCategories: (eventId: string) =>
    canhoesFetch<T.EventCategoryDto[]>(`/v1/events/${eventId}/categories`),
  getMyNominationStatus: (eventId: string) =>
    canhoesFetch<T.MyNominationStatusDto>(`/v1/events/${eventId}/nominations/my-status`),
  getApprovedNominees: (eventId: string) =>
    canhoesFetch<T.NomineeDto[]>(`/v1/events/${eventId}/nominations/approved`),
  createNomination: (eventId: string, payload: { categoryId: string | null; title: string; kind?: string }) =>
    canhoesFetch<T.NomineeDto>(`/v1/events/${eventId}/nominations`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  uploadNomineeImage: (eventId: string, nomineeId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return canhoesFetch<void>(`/v1/events/${eventId}/nominations/${nomineeId}/upload`, {
      method: "POST",
      body: formData,
      canhoes: { skipDeduplication: true },
    });
  },
  getOfficialVotingBoard: (eventId: string) =>
    canhoesFetch<T.OfficialVotingBoardDto>(`/v1/events/${eventId}/official-voting`),
  castOfficialVote: (eventId: string, payload: T.CastOfficialVoteRequest) =>
    canhoesFetch<void>(`/v1/events/${eventId}/official-votes`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getSecretSantaOverview: (eventId: string) =>
    canhoesFetch<T.EventSecretSantaOverviewDto>(`/v1/events/${eventId}/secret-santa/overview`),
  getWishlist: (eventId: string) =>
    canhoesFetch<T.EventWishlistItemDto[]>(`/v1/events/${eventId}/wishlist`),
  getMembers: (eventId: string) =>
    canhoesFetch<T.PublicUserDto[]>(`/v1/events/${eventId}/members`),
  createWishlistItem: (
    eventId: string,
    payload: { title: string; link: string | null; notes: string | null }
  ) =>
    canhoesFetch<T.EventWishlistItemDto>(`/v1/events/${eventId}/wishlist`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  uploadWishlistImage: (eventId: string, itemId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return canhoesFetch<void>(`/v1/events/${eventId}/wishlist/${itemId}/image`, {
      method: "POST",
      body: formData,
      canhoes: { skipDeduplication: true },
    });
  },
  deleteWishlistItem: (eventId: string, itemId: string) =>
    canhoesFetch<void>(`/v1/events/${eventId}/wishlist/${itemId}`, {
      method: "DELETE",
    }),
  createProposal: (eventId: string, payload: { name: string; description: string | null }) =>
    canhoesFetch<T.CategoryProposalDto>(`/v1/events/${eventId}/proposals`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  adminApproveNomination: (eventId: string, nomineeId: string) =>
    canhoesFetch(`/v1/events/${eventId}/admin/nominees/${nomineeId}/approve`, { method: "PUT" }),
  adminRejectNomination: (eventId: string, nomineeId: string) =>
    canhoesFetch(`/v1/events/${eventId}/admin/nominees/${nomineeId}/reject`, { method: "PUT" }),
  adminSetNominationCategory: (eventId: string, nomineeId: string, payload: { categoryId: string | null }) =>
    canhoesFetch(`/v1/events/${eventId}/admin/nominees/${nomineeId}/category`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
