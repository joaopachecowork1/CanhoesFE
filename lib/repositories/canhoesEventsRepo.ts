import { canhoesFetch } from "@/lib/api/canhoesClient";
import {
  normalizeWishlistItems,
} from "@/lib/api/responseNormalization";
import type * as T from "@/lib/api/types";

async function loadAllPagedRecords<TItem, TPage extends { hasMore: boolean; skip: number; take: number }>(
  loadPage: (skip: number, take: number) => Promise<TPage>,
  getItems: (page: TPage) => readonly TItem[],
  take = 200
): Promise<TItem[]> {
  const items: TItem[] = [];
  let skip = 0;

  for (;;) {
    const page = await loadPage(skip, take);
    const pageItems = Array.from(getItems(page));
    items.push(...pageItems);

    if (!page.hasMore || pageItems.length === 0) {
      return items;
    }

    skip = page.skip + page.take;
  }
}

// ============================================================================
// EVENT CONTEXT & OVERVIEW
// ============================================================================

export const canhoesEventsRepo = {
  listEvents: () =>
    canhoesFetch<T.EventSummaryDto[]>("/v1/events", {
      canhoes: { throwOnUnauthorized: true },
    }),

  getEventContext: (eventId: string) =>
    canhoesFetch<T.EventContextDto>(`/v1/events/${eventId}`),

  getEventOverview: (eventId: string) =>
    canhoesFetch<T.EventOverviewDto>(`/v1/events/${eventId}/overview`),

  getVotingOverview: (eventId: string) =>
    canhoesFetch<T.EventVotingOverviewDto>(`/v1/events/${eventId}/voting/overview`),

  getSecretSantaOverview: (eventId: string) =>
    canhoesFetch<T.EventSecretSantaOverviewDto>(`/v1/events/${eventId}/secret-santa/overview`),

  // FEED
  getFeedPosts: (eventId: string, options?: { skip?: number; take?: number }) => {
    const skip = options?.skip ?? 0;
    const take = options?.take ?? 20;
    return canhoesFetch<{ items: T.EventFeedPostFullDto[]; total: number; skip: number; take: number; hasMore: boolean }>(
      `/v1/events/${eventId}/feed/posts?skip=${skip}&take=${take}`
    );
  },

  createFeedPost: (eventId: string, payload: T.CreateEventFeedPostRequest) =>
    canhoesFetch<T.EventFeedPostFullDto>(`/v1/events/${eventId}/feed/posts`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  toggleFeedPostLike: (eventId: string, postId: string) =>
    canhoesFetch<{ liked: boolean }>(`/v1/events/${eventId}/feed/posts/${postId}/like`, {
      method: "POST",
    }),

  toggleFeedPostDownvote: (eventId: string, postId: string) =>
    canhoesFetch<{ downvoted: boolean }>(`/v1/events/${eventId}/feed/posts/${postId}/downvote`, {
      method: "POST",
    }),

  toggleFeedPostReaction: (eventId: string, postId: string, emoji: string) =>
    canhoesFetch<{ emoji: string; active: boolean }>(`/v1/events/${eventId}/feed/posts/${postId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    }),

  getFeedPostComments: (eventId: string, postId: string) =>
    canhoesFetch<T.HubCommentDto[]>(`/v1/events/${eventId}/feed/posts/${postId}/comments`),

  createFeedPostComment: (eventId: string, postId: string, payload: { text: string }) =>
    canhoesFetch<T.HubCommentDto>(`/v1/events/${eventId}/feed/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteFeedPostComment: (eventId: string, postId: string, commentId: string) =>
    canhoesFetch<void>(`/v1/events/${eventId}/feed/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    }),

  toggleFeedCommentReaction: (eventId: string, postId: string, commentId: string, emoji: string) =>
    canhoesFetch<{ emoji: string; active: boolean }>(`/v1/events/${eventId}/feed/posts/${postId}/comments/${commentId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    }),

  voteFeedPoll: (eventId: string, postId: string, optionId: string) =>
    canhoesFetch<{ optionId: string }>(`/v1/events/${eventId}/feed/posts/${postId}/poll/vote`, {
      method: "POST",
      body: JSON.stringify({ optionId }),
    }),

  adminPinFeedPost: (eventId: string, postId: string) =>
    canhoesFetch<{ pinned: boolean }>(`/v1/events/${eventId}/feed/posts/${postId}/pin`, {
      method: "POST",
    }),

  adminDeleteFeedPost: (eventId: string, postId: string) =>
    canhoesFetch<void>(`/v1/events/${eventId}/feed/posts/${postId}`, {
      method: "DELETE",
    }),

  uploadFeedImages: async (eventId: string, files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    const res = await fetch(`/api/proxy/v1/events/${eventId}/feed/uploads`, {
      method: "POST",
      body: form,
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error((await res.text().catch(() => "")) || res.statusText);
    const text = await res.text().catch(() => "");
    if (!text) return [];
    try {
      return JSON.parse(text) as string[];
    } catch {
      return [];
    }
  },

  // EVENT CATEGORIES (user-facing)
  getCategories: (eventId: string) =>
    canhoesFetch<T.EventCategoryDto[]>(`/v1/events/${eventId}/categories`),

  createCategory: (eventId: string, payload: T.CreateEventCategoryRequest) =>
    canhoesFetch<T.EventCategoryDto>(`/v1/events/${eventId}/categories`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ADMIN - AWARD CATEGORIES
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

  // ADMIN - STATE & BOOTSTRAP
  getAdminState: (eventId: string) =>
    canhoesFetch<T.EventAdminStateDto>(`/v1/events/${eventId}/admin/state`),

  getAdminBootstrap: (eventId: string, includeLists = false) =>
    canhoesFetch<T.EventAdminBootstrapDto>(
      `/v1/events/${eventId}/admin/bootstrap?includeLists=${includeLists}`
    ),

  // Paginated admin endpoints
  getAdminVotesPaged: (eventId: string, skip = 0, take = 50) =>
    canhoesFetch<T.AdminVotesPagedDto>(
      `/v1/events/${eventId}/admin/votes/paged?skip=${skip}&take=${take}`
    ),

  getAdminNominationsPaged: (eventId: string, skip = 0, take = 50, status?: string) =>
    canhoesFetch<T.AdminNomineesPagedDto>(
      `/v1/events/${eventId}/admin/nominations/paged?skip=${skip}&take=${take}${status ? `&status=${status}` : ""}`
    ),

  getAdminMembersPaged: (eventId: string, skip = 0, take = 50) =>
    canhoesFetch<T.PagedResultPublicUserDto>(
      `/v1/events/${eventId}/admin/members/paged?skip=${skip}&take=${take}`
    ),

  getAdminOfficialResultsPaged: (eventId: string, skip = 0, take = 50) =>
    canhoesFetch<T.PagedResultAdminCategoryResultDto>(
      `/v1/events/${eventId}/admin/official-results/paged?skip=${skip}&take=${take}`
    ),

  getAdminCategoriesSummary: (eventId: string) =>
    canhoesFetch<T.AwardCategorySummaryDto[]>(`/v1/events/${eventId}/admin/categories/summary`),

  getAdminNomineesSummary: (eventId: string, status?: string) =>
    canhoesFetch<T.NomineeSummaryDto[]>(
      `/v1/events/${eventId}/admin/nominees/summary${status ? `?status=${status}` : ""}`
    ),

  getAdminNominationsSummary: (eventId: string, status?: string) =>
    canhoesFetch<T.AdminNomineeSummaryDto[]>(
      `/v1/events/${eventId}/admin/nominations/summary${status ? `?status=${status}` : ""}`
    ),

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

  loadAdminMembersPage: (eventId: string, skip = 0, take = 50) =>
    canhoesFetch<T.PagedResultPublicUserDto>(
      `/v1/events/${eventId}/admin/members/paged?skip=${skip}&take=${take}`
    ),

  loadAdminNominationsPage: (
    eventId: string,
    skip = 0,
    take = 50,
    status?: "pending" | "approved" | "rejected"
  ) =>
    canhoesFetch<T.PagedResultAdminNomineeDto>(
      `/v1/events/${eventId}/admin/nominations/paged?skip=${skip}&take=${take}${status ? `&status=${status}` : ""}`
    ),

  loadAllAdminMembers: async (eventId: string) =>
    loadAllPagedRecords(
      (skip, take) => canhoesEventsRepo.loadAdminMembersPage(eventId, skip, take),
      (page) => page.items
    ),

  loadAllAdminNominations: async (
    eventId: string,
    status?: "pending" | "approved" | "rejected"
  ) =>
    loadAllPagedRecords(
      (skip, take) => canhoesEventsRepo.loadAdminNominationsPage(eventId, skip, take, status),
      (page) => page.items
    ),

  loadAllAdminVotes: async (eventId: string) =>
    loadAllPagedRecords(
      (skip, take) => canhoesEventsRepo.getAdminVotesPaged(eventId, skip, take),
      (page) => page.votes
    ),

  loadAllAdminOfficialResults: async (eventId: string) =>
    loadAllPagedRecords(
      (skip, take) => canhoesEventsRepo.getAdminOfficialResultsPaged(eventId, skip, take),
      (page) => page.items
    ),

  adminGetCategoryProposals: async (
    eventId: string,
    status?: "pending" | "approved" | "rejected"
  ) =>
    loadAllPagedRecords(
      (skip, take) =>
        canhoesFetch<T.PagedResult<T.CategoryProposalDto>>(
          `/v1/events/${eventId}/admin/category-proposals?skip=${skip}&take=${take}${status ? `&status=${encodeURIComponent(status)}` : ""}`
        ),
      (page) => page.items
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

  adminGetMeasureProposals: async (
    eventId: string,
    status?: "pending" | "approved" | "rejected"
  ) =>
    loadAllPagedRecords(
      (skip, take) =>
        canhoesFetch<T.PagedResult<T.MeasureProposalDto>>(
          `/v1/events/${eventId}/admin/measure-proposals?skip=${skip}&take=${take}${status ? `&status=${encodeURIComponent(status)}` : ""}`
        ),
      (page) => page.items
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

  // VOTING (user-facing)
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

  // PROPOSALS (user-facing)
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

  // WISHLIST
  getWishlist: async (eventId: string) =>
    normalizeWishlistItems(
      await canhoesFetch<unknown>(`/v1/events/${eventId}/wishlist`)
    ),

  createWishlistItem: (eventId: string, payload: T.CreateEventWishlistItemRequest) =>
    canhoesFetch<T.EventWishlistItemDto>(`/v1/events/${eventId}/wishlist`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteWishlistItem: (eventId: string, itemId: string) =>
    canhoesFetch<void>(`/v1/events/${eventId}/wishlist/${itemId}`, {
      method: "DELETE",
    }),

  uploadWishlistImage: async (eventId: string, itemId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/proxy/v1/events/${eventId}/wishlist/${itemId}/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error((await res.text().catch(() => "")) || res.statusText);
    const text = await res.text().catch(() => "");
    if (!text) return undefined;
    try {
      return JSON.parse(text) as T.EventWishlistItemDto;
    } catch {
      return undefined;
    }
  },

  // WISHLIST IMAGE UPLOAD — uses same pattern as feed uploads
  uploadNomineeImage: async (eventId: string, nomineeId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/proxy/v1/events/${eventId}/nominations/${nomineeId}/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error((await res.text().catch(() => "")) || res.statusText);
    const text = await res.text().catch(() => "");
    if (!text) return undefined;
    try {
      return JSON.parse(text) as T.NomineeDto;
    } catch {
      return undefined;
    }
  },

  // MEASURES (user-facing) — list approved measures and propose new ones
  getMeasures: (eventId: string) =>
    canhoesFetch<T.GalaMeasureDto[]>(`/v1/events/${eventId}/measures`),

  createMeasureProposal: (eventId: string, payload: T.CreateMeasureProposalRequest) =>
    canhoesFetch<T.MeasureProposalDto>(`/v1/events/${eventId}/measures/proposals`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // RESULTS (user-facing) — gala results for the current event
  getResults: (eventId: string) =>
    canhoesFetch<T.CanhoesCategoryResultDto[]>(`/v1/events/${eventId}/results`),

  // MEMBERS (user-facing) — list members of the current event
  getMembers: (eventId: string) =>
    canhoesFetch<T.PublicUserDto[]>(`/v1/events/${eventId}/members`),

  // CATEGORIES (user-facing, alias to existing getCategories but returns AwardCategoryDto for legacy compat)
  getUserCategories: (eventId: string) =>
    canhoesFetch<T.AwardCategoryDto[]>(`/v1/events/${eventId}/categories`),
};

export default canhoesEventsRepo;
