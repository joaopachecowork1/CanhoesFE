import { canhoesFetch } from "@/lib/api/canhoesClient";
import type * as T from "@/lib/api/types";

/**
 * Canhões do Ano API Repository
 *
 * Architecture: UI → Repository → canhoesFetch → /api/proxy → Backend
 * One function = one endpoint (junior-friendly)
 *
 * NOTE: This repo uses the legacy `/canhoes/...` endpoint prefix.
 * New code should prefer `canhoesEventsRepo` which uses the event-scoped
 * `/v1/events/:eventId/...` prefix. Duplicate functions below are marked
 * as @deprecated for gradual migration.
 */
export const canhoesRepo = {
  // ==========================================
  // PUBLIC - Event State & Categories
  // ==========================================

  getState: () => canhoesFetch<T.CanhoesStateDto>("/canhoes/state"),

  /** @deprecated Use canhoesEventsRepo.getCategories(eventId) instead */
  getCategories: () => canhoesFetch<T.AwardCategoryDto[]>("/canhoes/categories"),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  getMeasures: () => canhoesFetch<T.GalaMeasureDto[]>("/canhoes/measures"),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  getResults: () => canhoesFetch<T.CanhoesCategoryResultDto[]>("/canhoes/results"),

  // ==========================================
  // PUBLIC - Nominees
  // ==========================================

  /** @deprecated No event-scoped equivalent. Legacy global state endpoint. */
  getNominees: (categoryId?: string, kind?: "nominees" | "stickers") => {
    const query = new URLSearchParams();
    if (categoryId) query.set("categoryId", categoryId);
    if (kind) query.set("kind", kind);

    return canhoesFetch<T.NomineeDto[]>(
      `/canhoes/nominees${query.toString() ? `?${query.toString()}` : ""}`
    );
  },

  createNominee: (payload: T.CreateNomineeRequest) =>
    canhoesFetch<T.NomineeDto>("/canhoes/nominees", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** @deprecated No event-scoped equivalent. Upload via FormData. */
  uploadNomineeImage: async (nomineeId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/proxy/canhoes/nominees/${nomineeId}/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || res.statusText || "Upload failed");
    }
    const text = await res.text().catch(() => "");
    if (!text) return undefined;
    try {
      return JSON.parse(text) as T.NomineeDto;
    } catch {
      return undefined;
    }
  },

  // ==========================================
  // PUBLIC - Proposals
  // ==========================================

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  createCategoryProposal: (payload: T.CreateCategoryProposalRequest) =>
    canhoesFetch<T.CategoryProposalDto>("/canhoes/categories/proposals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  createMeasureProposal: (payload: T.CreateMeasureProposalRequest) =>
    canhoesFetch<T.MeasureProposalDto>("/canhoes/measures/proposals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ==========================================
  // PUBLIC - Voting
  // ==========================================

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  myVotes: () => canhoesFetch<T.VoteDto[]>("/canhoes/my-votes"),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  castVote: (payload: T.CastVoteRequest) =>
    canhoesFetch<T.VoteDto>("/canhoes/vote", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** @deprecated No event-scoped equivalent. */
  myUserVotes: () => canhoesFetch<T.UserVoteDto[]>("/canhoes/my-user-votes"),

  /** @deprecated No event-scoped equivalent. */
  castUserVote: (payload: T.CastUserVoteRequest) =>
    canhoesFetch<T.UserVoteDto>("/canhoes/user-vote", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ==========================================
  // PUBLIC - Members
  // ==========================================

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  getMembers: () => canhoesFetch<T.PublicUserDto[]>("/canhoes/members"),

  // ==========================================
  // PUBLIC - Wishlist
  // ==========================================

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  getWishlist: () => canhoesFetch<T.WishlistItemDto[]>("/canhoes/wishlist"),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  createWishlistItem: (payload: T.CreateWishlistItemRequest) =>
    canhoesFetch<T.WishlistItemDto>("/canhoes/wishlist", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** @deprecated No event-scoped equivalent. */
  deleteWishlistItem: (id: string) =>
    canhoesFetch<void>(`/canhoes/wishlist/${id}`, { method: "DELETE" }),

  /** @deprecated No event-scoped equivalent. Upload via FormData. */
  uploadWishlistImage: async (itemId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/proxy/canhoes/wishlist/${itemId}/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error((await res.text().catch(() => "")) || res.statusText);
  },

  // ==========================================
  // PUBLIC - Secret Santa
  // ==========================================

  /** @deprecated No event-scoped equivalent. */
  getSecretSantaMe: (eventCode?: string) =>
    canhoesFetch<T.SecretSantaMeDto>(
      `/canhoes/secret-santa/me${eventCode ? `?eventCode=${encodeURIComponent(eventCode)}` : ""}`
    ),

  // ==========================================
  // ADMIN - Secret Santa
  // ==========================================

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  adminDrawSecretSanta: (payload: T.CreateSecretSantaDrawRequest) =>
    canhoesFetch<T.SecretSantaDrawDto>("/canhoes/secret-santa/draw", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ==========================================
  // ADMIN - Pending Approvals
  // ==========================================

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  adminGetAllNominees: (status?: string) =>
    canhoesFetch<T.NomineeDto[]>(
      `/canhoes/admin/nominees${status ? `?status=${encodeURIComponent(status)}` : ""}`
    ),

  /** @deprecated No event-scoped equivalent. */
  adminPending: () => canhoesFetch<T.PendingAdminDto>("/canhoes/admin/pending"),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  approveNominee: (id: string) =>
    canhoesFetch<T.NomineeDto>(`/canhoes/admin/nominees/${id}/approve`, { method: "POST" }),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  rejectNominee: (id: string) =>
    canhoesFetch<T.NomineeDto>(`/canhoes/admin/nominees/${id}/reject`, { method: "POST" }),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  adminSetNomineeCategory: (id: string, payload: T.SetNomineeCategoryRequest) =>
    canhoesFetch<T.NomineeDto>(`/canhoes/admin/nominees/${id}/set-category`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** @deprecated No event-scoped equivalent. */
  adminApproveCategoryProposal: (id: string) =>
    canhoesFetch<T.AwardCategoryDto>(`/canhoes/admin/categories/${id}/approve`, { method: "POST" }),

  /** @deprecated No event-scoped equivalent. */
  adminRejectCategoryProposal: (id: string) =>
    canhoesFetch<T.CategoryProposalDto>(`/canhoes/admin/categories/${id}/reject`, { method: "POST" }),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  adminApproveMeasureProposal: (id: string) =>
    canhoesFetch<T.GalaMeasureDto>(`/canhoes/admin/measures/${id}/approve`, { method: "POST" }),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  adminRejectMeasureProposal: (id: string) =>
    canhoesFetch<T.MeasureProposalDto>(`/canhoes/admin/measures/${id}/reject`, { method: "POST" }),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  adminListMeasureProposals: (status?: "pending" | "approved" | "rejected" | "all") =>
    canhoesFetch<T.MeasureProposalDto[]>(
      `/canhoes/admin/measures/proposals${status && status !== "all" ? `?status=${encodeURIComponent(status)}` : ""}`
    ),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  adminUpdateMeasureProposal: (id: string, payload: T.UpdateMeasureProposalRequest) =>
    canhoesFetch<T.MeasureProposalDto>(`/canhoes/admin/measures/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  adminDeleteMeasureProposal: (id: string) =>
    canhoesFetch<void>(`/canhoes/admin/measures/${id}`, { method: "DELETE" }),

  // ==========================================
  // ADMIN - Categories & State
  // ==========================================

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  adminGetAllCategories: () => canhoesFetch<T.AwardCategoryDto[]>("/canhoes/admin/categories"),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  adminCreateCategory: (payload: T.CreateAwardCategoryRequest) =>
    canhoesFetch<T.AwardCategoryDto>("/canhoes/admin/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** @deprecated Use canhoesEventsRepo (event-scoped) instead */
  adminUpdateCategory: (id: string, payload: T.UpdateAwardCategoryRequest) =>
    canhoesFetch<T.AwardCategoryDto>(`/canhoes/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  /** @deprecated No event-scoped equivalent. Method differs: POST vs PUT. */
  updateState: (state: T.CanhoesStateDto) =>
    canhoesFetch<T.CanhoesStateDto>("/canhoes/admin/state", {
      method: "POST",
      body: JSON.stringify(state),
    }),

  // ==========================================
  // ADMIN - Votes Overview
  // ==========================================

  /** @deprecated No event-scoped equivalent. Returns different shape. */
  adminVotes: () =>
    canhoesFetch<{
      total: number;
      votes: {
        categoryId: string;
        nomineeId: string;
        userId: string;
        updatedAtUtc: string;
      }[];
    }>("/canhoes/admin/votes"),

  // ==========================================
  // ADMIN - Proposals History (approved/rejected/pending)
  // ==========================================

  /** @deprecated No event-scoped equivalent. */
  adminProposalsHistory: () =>
    canhoesFetch<{
      categoryProposals:
        | T.CategoryProposalDto[]
        | { pending?: T.CategoryProposalDto[]; approved?: T.CategoryProposalDto[]; rejected?: T.CategoryProposalDto[] };
      measureProposals:
        | T.MeasureProposalDto[]
        | { pending?: T.MeasureProposalDto[]; approved?: T.MeasureProposalDto[]; rejected?: T.MeasureProposalDto[] };
    }>("/canhoes/admin/proposals"),
};

export default canhoesRepo;
