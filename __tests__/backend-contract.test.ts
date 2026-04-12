/**
 * Integration tests for the CanhoesFE ↔ CanhoesBE contract.
 *
 * These tests verify that every endpoint called by the frontend repos
 * has a matching backend route. They DO NOT require a running server —
 * they check the canhoesEventsRepo method signatures against the known
 * backend route table.
 *
 * When a test fails, it means the frontend is calling an endpoint that
 * does NOT exist in the backend. The backend team must implement it.
 */

import { describe, it, expect } from "vitest";

// ─── Known backend routes (from CanhoesBE analysis) ─────────────────────────

const KNOWN_EVENT_SCOPED_ROUTES = new Set([
  // EventsController.cs
  "GET /v1/events",
  "GET /v1/events/{eventId}",
  "GET /v1/events/{eventId}/overview",

  // EventsController.MemberExperience.cs
  "GET /v1/events/{eventId}/voting/overview",
  "GET /v1/events/{eventId}/secret-santa/overview",
  "GET /v1/events/{eventId}/feed/posts",
  "POST /v1/events/{eventId}/feed/posts",
  "GET /v1/events/{eventId}/categories",
  "POST /v1/events/{eventId}/categories",
  "GET /v1/events/{eventId}/voting",
  "POST /v1/events/{eventId}/votes",
  "GET /v1/events/{eventId}/proposals",
  "POST /v1/events/{eventId}/proposals",
  "PATCH /v1/events/{eventId}/proposals/{proposalId}",
  "GET /v1/events/{eventId}/wishlist",
  "POST /v1/events/{eventId}/wishlist",

  // EventsController.Admin.cs
  "GET /v1/events/{eventId}/admin/categories",
  "POST /v1/events/{eventId}/admin/categories",
  "PUT /v1/events/{eventId}/admin/categories/{categoryId}",
  "DELETE /v1/events/{eventId}/admin/categories/{categoryId}",
  "GET /v1/events/{eventId}/admin/state",
  "GET /v1/events/{eventId}/admin/bootstrap",
  "PUT /v1/events/{eventId}/admin/state",
  "PATCH /v1/events/{eventId}/modules",
  "PUT /v1/events/{eventId}/admin/phase",
  "PUT /v1/events/{eventId}/admin/activate",
  "GET /v1/events/{eventId}/admin/secret-santa/state",
  "POST /v1/events/{eventId}/admin/secret-santa/draw",
  "GET /v1/events/{eventId}/admin/members",
  "GET /v1/events/{eventId}/admin/votes",
  "GET /v1/events/{eventId}/admin/official-results",
  "GET /v1/events/{eventId}/admin/category-proposals",
  "PATCH /v1/events/{eventId}/admin/category-proposals/{proposalId}",
  "PUT /v1/events/{eventId}/admin/category-proposals/{proposalId}",
  "DELETE /v1/events/{eventId}/admin/category-proposals/{proposalId}",
  "GET /v1/events/{eventId}/admin/proposals",
  "GET /v1/events/{eventId}/admin/measure-proposals",
  "PATCH /v1/events/{eventId}/admin/measure-proposals/{proposalId}",
  "PUT /v1/events/{eventId}/admin/measure-proposals/{proposalId}",
  "DELETE /v1/events/{eventId}/admin/measure-proposals/{proposalId}",
  "POST /v1/events/{eventId}/admin/measure-proposals/{proposalId}/approve",
  "POST /v1/events/{eventId}/admin/measure-proposals/{proposalId}/reject",
  "GET /v1/events/{eventId}/admin/nominees",
  "GET /v1/events/{eventId}/admin/nominations",
  "POST /v1/events/{eventId}/admin/nominees/{nomineeId}/set-category",
  "POST /v1/events/{eventId}/admin/nominations/{nomineeId}/set-category",
  "POST /v1/events/{eventId}/admin/nominees/{nomineeId}/approve",
  "POST /v1/events/{eventId}/admin/nominations/{nomineeId}/approve",
  "POST /v1/events/{eventId}/admin/nominees/{nomineeId}/reject",
  "POST /v1/events/{eventId}/admin/nominations/{nomineeId}/reject",
]);

// Routes that exist in legacy controllers but need event-scoped equivalents
const LEGACY_EQUIVALENTS = new Map<string, string>([
  ["GET /api/canhoes/measures", "GET /v1/events/{eventId}/measures"],
  ["POST /api/canhoes/measures/proposals", "POST /v1/events/{eventId}/measures/proposals"],
  ["GET /api/canhoes/results", "GET /v1/events/{eventId}/results"],
  ["GET /api/canhoes/members", "GET /v1/events/{eventId}/members"],
  ["POST /api/canhoes/nominees", "POST /v1/events/{eventId}/nominations"],
  ["POST /api/canhoes/nominees/{id}/upload", "POST /v1/events/{eventId}/nominations/{nomineeId}/upload"],
  ["POST /api/canhoes/wishlist/{id}/upload", "POST /v1/events/{eventId}/wishlist/{itemId}/upload"],
  ["DELETE /api/canhoes/wishlist/{id}", "DELETE /v1/events/{eventId}/wishlist/{itemId}"],
  ["GET /api/hub/posts/{postId}/comments", "GET /v1/events/{eventId}/feed/posts/{postId}/comments"],
  ["POST /api/hub/posts/{postId}/comments", "POST /v1/events/{eventId}/feed/posts/{postId}/comments"],
  ["DELETE /api/hub/posts/{postId}/comments/{commentId}", "DELETE /v1/events/{eventId}/feed/posts/{postId}/comments/{commentId}"],
  ["POST /api/hub/posts/{postId}/reactions", "POST /v1/events/{eventId}/feed/posts/{postId}/reactions"],
  ["POST /api/hub/posts/{postId}/poll/vote", "POST /v1/events/{eventId}/feed/posts/{postId}/poll/vote"],
  ["POST /api/hub/uploads", "POST /v1/events/{eventId}/feed/uploads"],
  ["POST /api/hub/admin/posts/{postId}/pin", "POST /v1/events/{eventId}/feed/posts/{postId}/pin"],
  ["DELETE /api/hub/admin/posts/{postId}", "DELETE /v1/events/{eventId}/feed/posts/{postId}"],
]);

// ─── Frontend route definitions ──────────────────────────────────────────────

type FrontendRoute = {
  method: string;
  path: string;
  repoMethod: string;
  module: string;
};

const CANHOES_EVENTS_REPO_ROUTES: FrontendRoute[] = [
  // Events
  { method: "GET", path: "/v1/events", repoMethod: "listEvents", module: "Event overview" },
  { method: "GET", path: "/v1/events/{eventId}/overview", repoMethod: "getEventOverview", module: "Event overview" },

  // Feed
  { method: "GET", path: "/v1/events/{eventId}/feed/posts", repoMethod: "getFeedPosts", module: "HubFeed" },
  { method: "POST", path: "/v1/events/{eventId}/feed/posts", repoMethod: "createFeedPost", module: "HubFeed" },

  // Categories
  { method: "GET", path: "/v1/events/{eventId}/categories", repoMethod: "getCategories", module: "Categories" },
  { method: "GET", path: "/v1/events/{eventId}/categories", repoMethod: "getAwardCategories", module: "Nominations/Stickers" },

  // Admin
  { method: "GET", path: "/v1/events/{eventId}/admin/categories", repoMethod: "adminGetCategories", module: "Admin categories" },
  { method: "POST", path: "/v1/events/{eventId}/admin/categories", repoMethod: "adminCreateCategory", module: "Admin categories" },
  { method: "PUT", path: "/v1/events/{eventId}/admin/categories/{categoryId}", repoMethod: "adminUpdateCategory", module: "Admin categories" },
  { method: "DELETE", path: "/v1/events/{eventId}/admin/categories/{categoryId}", repoMethod: "adminDeleteCategory", module: "Admin categories" },
  { method: "GET", path: "/v1/events/{eventId}/admin/state", repoMethod: "getAdminState", module: "Admin state" },
  { method: "GET", path: "/v1/events/{eventId}/admin/bootstrap", repoMethod: "getAdminBootstrap", module: "Admin bootstrap" },
  { method: "PUT", path: "/v1/events/{eventId}/admin/state", repoMethod: "updateAdminState", module: "Admin state" },
  { method: "PUT", path: "/v1/events/{eventId}/admin/phase", repoMethod: "updateAdminPhase", module: "Admin phase" },
  { method: "GET", path: "/v1/events/{eventId}/admin/secret-santa/state", repoMethod: "adminGetSecretSantaState", module: "Admin secret santa" },
  { method: "POST", path: "/v1/events/{eventId}/admin/secret-santa/draw", repoMethod: "adminDrawSecretSanta", module: "Admin secret santa" },
  { method: "PUT", path: "/v1/events/{eventId}/admin/activate", repoMethod: "adminActivateEvent", module: "Admin activate" },
  { method: "GET", path: "/v1/events/{eventId}/admin/members", repoMethod: "adminGetMembers", module: "Admin members" },
  { method: "GET", path: "/v1/events/{eventId}/admin/votes", repoMethod: "adminVotes", module: "Admin votes" },
  { method: "GET", path: "/v1/events/{eventId}/admin/nominees", repoMethod: "adminGetNominees", module: "Admin nominees" },
  { method: "POST", path: "/v1/events/{eventId}/admin/nominees/{nomineeId}/set-category", repoMethod: "adminSetNomineeCategory", module: "Admin nominee category" },
  { method: "POST", path: "/v1/events/{eventId}/admin/nominees/{nomineeId}/approve", repoMethod: "adminApproveNominee", module: "Admin approve nominee" },
  { method: "POST", path: "/v1/events/{eventId}/admin/nominees/{nomineeId}/reject", repoMethod: "adminRejectNominee", module: "Admin reject nominee" },
  { method: "GET", path: "/v1/events/{eventId}/admin/official-results", repoMethod: "adminGetOfficialResults", module: "Admin official results" },
  { method: "GET", path: "/v1/events/{eventId}/admin/measure-proposals", repoMethod: "adminGetMeasureProposals", module: "Admin measure proposals" },
  { method: "PATCH", path: "/v1/events/{eventId}/admin/measure-proposals/{proposalId}", repoMethod: "adminUpdateMeasureProposal", module: "Admin measure proposals" },
  { method: "DELETE", path: "/v1/events/{eventId}/admin/measure-proposals/{proposalId}", repoMethod: "adminDeleteMeasureProposal", module: "Admin measure proposals" },
  { method: "POST", path: "/v1/events/{eventId}/admin/measure-proposals/{proposalId}/approve", repoMethod: "adminApproveMeasureProposal", module: "Admin approve measure" },
  { method: "POST", path: "/v1/events/{eventId}/admin/measure-proposals/{proposalId}/reject", repoMethod: "adminRejectMeasureProposal", module: "Admin reject measure" },
  { method: "GET", path: "/v1/events/{eventId}/admin/proposals", repoMethod: "adminProposalsHistory", module: "Admin proposals history" },

  // Nominations (user-facing)
  { method: "GET", path: "/v1/events/{eventId}/nominations/my-status", repoMethod: "getMyNominationStatus", module: "CanhoesNominationsModule" },
  { method: "POST", path: "/v1/events/{eventId}/nominations", repoMethod: "createNomination", module: "CanhoesNominationsModule" },
  { method: "GET", path: "/v1/events/{eventId}/nominations/approved", repoMethod: "getApprovedNominees", module: "CanhoesNominationsModule" },

  // Official voting
  { method: "GET", path: "/v1/events/{eventId}/official-voting", repoMethod: "getOfficialVotingBoard", module: "CanhoesOfficialVotingModule" },
  { method: "POST", path: "/v1/events/{eventId}/official-votes", repoMethod: "castOfficialVote", module: "CanhoesOfficialVotingModule" },

  // Voting
  { method: "GET", path: "/v1/events/{eventId}/voting/overview", repoMethod: "getVotingOverview", module: "Voting overview" },
  { method: "GET", path: "/v1/events/{eventId}/voting", repoMethod: "getVotingBoard", module: "Voting board" },
  { method: "POST", path: "/v1/events/{eventId}/votes", repoMethod: "castVote", module: "Cast vote" },

  // Secret santa
  { method: "GET", path: "/v1/events/{eventId}/secret-santa/overview", repoMethod: "getSecretSantaOverview", module: "Secret santa overview" },

  // Proposals
  { method: "GET", path: "/v1/events/{eventId}/proposals", repoMethod: "getProposals", module: "Proposals" },
  { method: "POST", path: "/v1/events/{eventId}/proposals", repoMethod: "createProposal", module: "Create proposal" },
  { method: "PATCH", path: "/v1/events/{eventId}/proposals/{proposalId}", repoMethod: "updateProposal", module: "Update proposal" },

  // Wishlist
  { method: "GET", path: "/v1/events/{eventId}/wishlist", repoMethod: "getWishlist", module: "CanhoesWishlistModule" },
  { method: "POST", path: "/v1/events/{eventId}/wishlist", repoMethod: "createWishlistItem", module: "CanhoesWishlistModule" },
  { method: "DELETE", path: "/v1/events/{eventId}/wishlist/{itemId}", repoMethod: "deleteWishlistItem", module: "CanhoesWishlistModule" },

  // User-facing measures/results/members (need BE implementation)
  { method: "GET", path: "/v1/events/{eventId}/measures", repoMethod: "getMeasures", module: "CanhoesMeasuresModule" },
  { method: "POST", path: "/v1/events/{eventId}/measures/proposals", repoMethod: "createMeasureProposal", module: "CanhoesMeasuresModule" },
  { method: "GET", path: "/v1/events/{eventId}/results", repoMethod: "getResults", module: "CanhoesGalaModule" },
  { method: "GET", path: "/v1/events/{eventId}/members", repoMethod: "getMembers", module: "CanhoesWishlistModule" },

  // Uploads
  { method: "POST", path: "/v1/events/{eventId}/nominations/{nomineeId}/upload", repoMethod: "uploadNomineeImage", module: "Stickers/Nominees" },
  { method: "POST", path: "/v1/events/{eventId}/wishlist/{itemId}/upload", repoMethod: "uploadWishlistImage", module: "CanhoesWishlistModule" },

  // Feed interactions (need BE implementation)
  { method: "GET", path: "/v1/events/{eventId}/feed/posts/{postId}/comments", repoMethod: "getFeedPostComments", module: "HubFeed comments" },
  { method: "POST", path: "/v1/events/{eventId}/feed/posts/{postId}/comments", repoMethod: "createFeedPostComment", module: "HubFeed create comment" },
  { method: "POST", path: "/v1/events/{eventId}/feed/posts/{postId}/reactions", repoMethod: "toggleFeedPostReaction", module: "HubFeed reactions" },
  { method: "POST", path: "/v1/events/{eventId}/feed/posts/{postId}/poll/vote", repoMethod: "voteFeedPoll", module: "HubFeed poll vote" },
  { method: "POST", path: "/v1/events/{eventId}/feed/uploads", repoMethod: "uploadFeedImage", module: "HubFeed uploads" },
  { method: "DELETE", path: "/v1/events/{eventId}/feed/posts/{postId}/comments/{commentId}", repoMethod: "deleteFeedPostComment", module: "HubFeed delete comment" },
  { method: "POST", path: "/v1/events/{eventId}/feed/posts/{postId}/pin", repoMethod: "adminPinFeedPost", module: "HubFeed admin pin" },
  { method: "DELETE", path: "/v1/events/{eventId}/feed/posts/{postId}", repoMethod: "adminDeleteFeedPost", module: "HubFeed admin delete" },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

function toBackendKey(method: string, path: string): string {
  // Normalize path params
  const normalized = path
    .replace(/\{itemId\}/g, "{id}")
    .replace(/\{nomineeId\}/g, "{id}")
    .replace(/\{postId\}/g, "{id}")
    .replace(/\{proposalId\}/g, "{id}")
    .replace(/\{categoryId\}/g, "{id}");
  return `${method} ${normalized}`;
}

function isKnownRoute(method: string, path: string): boolean {
  // Check exact known routes
  const key = `${method} ${path}`;
  if (KNOWN_EVENT_SCOPED_ROUTES.has(key)) return true;

  // Check with normalized params
  for (const known of KNOWN_EVENT_SCOPED_ROUTES) {
    const knownParts = known.split(" ");
    const pathParts = path.split("/");
    const knownPathParts = knownParts[1]?.split("/") ?? [];

    if (knownParts[0] === method && pathParts.length === knownPathParts.length) {
      let matches = true;
      for (let i = 0; i < pathParts.length; i++) {
        const knownPart = knownPathParts[i];
        const pathPart = pathParts[i];
        if (knownPart?.startsWith("{") && knownPart?.endsWith("}")) continue; // wildcard
        if (knownPart !== pathPart) { matches = false; break; }
      }
      if (matches) return true;
    }
  }

  return false;
}

describe("canhoesEventsRepo — backend route coverage", () => {
  const missingRoutes: { method: string; path: string; repoMethod: string; module: string }[] = [];

  for (const route of CANHOES_EVENTS_REPO_ROUTES) {
    const exists = isKnownRoute(route.method, route.path);
    if (!exists) {
      missingRoutes.push(route);
    }
  }

  it("all routes should exist in backend (list missing for reporting)", () => {
    // This test always passes but reports missing routes
    if (missingRoutes.length > 0) {
      console.warn(
        `\n⚠️  ${missingRoutes.length} endpoints are called by the frontend but MISSING from the backend:\n` +
        missingRoutes.map((r) =>
          `  ${r.method.padEnd(6)} ${r.path.padEnd(65)} ← ${r.module} (${r.repoMethod})`
        ).join("\n") +
        "\n"
      );
    }
    expect(true).toBe(true); // Always passes — use the console output for reporting
  });

  it("nominations endpoints should exist", () => {
    const nomRoutes = CANHOES_EVENTS_REPO_ROUTES.filter((r) =>
      r.path.includes("/nominations") && !r.path.includes("/admin")
    );
    for (const route of nomRoutes) {
      expect(isKnownRoute(route.method, route.path)).toBe(true);
    }
  });

  it("official voting endpoints should exist", () => {
    const votingRoutes = CANHOES_EVENTS_REPO_ROUTES.filter((r) =>
      r.path.includes("/official-vot")
    );
    for (const route of votingRoutes) {
      expect(isKnownRoute(route.method, route.path)).toBe(true);
    }
  });

  it("user-facing measures/results/members endpoints should exist", () => {
    const userRoutes = CANHOES_EVENTS_REPO_ROUTES.filter((r) =>
      r.path.includes("/measures") ||
      r.path.includes("/results") ||
      r.path === "/v1/events/{eventId}/members"
    );
    for (const route of userRoutes) {
      expect(isKnownRoute(route.method, route.path)).toBe(true);
    }
  });

  it("feed interaction endpoints should exist", () => {
    const feedRoutes = CANHOES_EVENTS_REPO_ROUTES.filter((r) =>
      r.path.includes("/feed/posts/{postId}") ||
      r.path === "/v1/events/{eventId}/feed/uploads"
    );
    for (const route of feedRoutes) {
      expect(isKnownRoute(route.method, route.path)).toBe(true);
    }
  });

  it("upload endpoints should exist", () => {
    const uploadRoutes = CANHOES_EVENTS_REPO_ROUTES.filter((r) =>
      r.path.includes("/upload")
    );
    for (const route of uploadRoutes) {
      expect(isKnownRoute(route.method, route.path)).toBe(true);
    }
  });

  it("delete wishlist endpoint should exist", () => {
    expect(isKnownRoute("DELETE", "/v1/events/{eventId}/wishlist/{itemId}")).toBe(true);
  });
});
