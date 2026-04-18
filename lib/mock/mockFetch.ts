/**
 * Mock fetch interceptor.
 *
 * When `IS_MOCK_MODE` is true this function is called instead of the real
 * network request.  It pattern-matches the proxy path (which looks like
 * `/api/proxy/canhoes/...`) and returns appropriate static fixtures.
 *
 * GET  → returns fixture data
 * POST/PUT/PATCH/DELETE → returns a minimal success payload
 */

import {
  MOCK_ADMIN_NOMINEES,
  MOCK_ADMIN_OFFICIAL_RESULTS,
  MOCK_APPROVED_NOMINEES,
  MOCK_STATE,
  MOCK_CATEGORIES,
  MOCK_NOMINEES,
  MOCK_CATEGORY_PROPOSALS,
  MOCK_MEASURE_PROPOSALS,
  MOCK_MEMBERS,
  MOCK_HUB_POSTS,
  MOCK_VOTES,
  MOCK_EVENT_CATEGORIES,
  MOCK_EVENT_CONTEXT,
  MOCK_EVENT_OVERVIEW,
  MOCK_EVENT_POSTS,
  MOCK_EVENT_PROPOSALS,
  MOCK_EVENT_SECRET_SANTA_OVERVIEW,
  MOCK_EVENT_SUMMARY,
  MOCK_EVENT_VOTING_OVERVIEW,
  MOCK_EVENT_VOTING_BOARD,
  MOCK_MY_NOMINATION_STATUS,
  MOCK_OFFICIAL_VOTING_BOARD,
  MOCK_EVENT_WISHLIST,
} from "./mockData";

/** Simulate a small network delay so skeletons are visible in dev. */
const MOCK_DELAY_MS = 120;

function simulateNetworkDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

/**
 * Returns mock data for a given proxy path + HTTP method.
 *
 * @param proxyPath - Full proxy path, e.g. `/api/proxy/canhoes/state`
 * @param method    - HTTP method in uppercase
 */
export async function getMockResponse<T>(
  proxyPath: string,
  method: string,
  options?: { body?: string | null }
): Promise<T> {
  await simulateNetworkDelay();

  // Normalise: strip leading `/api/proxy/`
  const path = proxyPath.replace(/^\/api\/proxy\//, "").replace(/^\//, "");
  const verb = (method || "GET").toUpperCase();

  // ── Write operations: return an optimistic success payload ──────────────────
  if (verb !== "GET") {
    return handleWrite<T>(path, options);
  }

  // ── Read operations ──────────────────────────────────────────────────────────
  return handleRead<T>(path);
}

function parseBody<TBody>(options?: { body?: string | null }) {
  const raw = options?.body;
  if (!raw) return {} as TBody;

  try {
    return JSON.parse(raw) as TBody;
  } catch {
    return {} as TBody;
  }
}

function parsePagedQuery(path: string) {
  const url = new URL(`http://x/${path}`);
  const skip = Math.max(0, Number.parseInt(url.searchParams.get("skip") ?? "0", 10) || 0);
  const take = Math.max(1, Number.parseInt(url.searchParams.get("take") ?? "50", 10) || 50);
  return { skip, take, url };
}

function paginateItems<T>(items: T[], skip: number, take: number) {
  const pagedItems = items.slice(skip, skip + take);
  return {
    items: pagedItems,
    total: items.length,
    skip,
    take,
    hasMore: skip + pagedItems.length < items.length,
  };
}

function handleWrite<T>(path: string, options?: { body?: string | null }): T {
  if (path === `v1/events/${MOCK_EVENT_SUMMARY.id}/nominations`) {
    const body = parseBody<{ categoryId?: string | null; title?: string }>(options);
    const alreadyNominated = MOCK_MY_NOMINATION_STATUS.find(
      (status) => status.categoryId === body.categoryId && status.hasNominated
    );

    if (alreadyNominated) {
      throw new Error("Ja submeteste uma nomeacao para esta categoria.");
    }

    return {
      id: `nom-mock-${Date.now()}`,
      categoryId: body.categoryId ?? null,
      title: body.title ?? "Nomeacao sem titulo",
      status: "pending",
      createdAtUtc: new Date().toISOString(),
      submittedByMe: true,
    } as unknown as T;
  }

  if (path === `v1/events/${MOCK_EVENT_SUMMARY.id}/official-votes`) {
    const body = parseBody<{ categoryId?: string; nomineeId?: string }>(options);

    return {
      id: `vote-${Date.now()}`,
      userId: "mock-admin-001",
      categoryId: body.categoryId ?? "",
      nomineeId: body.nomineeId ?? "",
      phaseId: "phase-voting",
      updatedAtUtc: new Date().toISOString(),
    } as unknown as T;
  }

  if (/^v1\/events\/.+\/admin\/nominations\/.+\/approve$/.test(path)) {
    const nomineeId = path.split("/")[5];
    const nominee = MOCK_ADMIN_NOMINEES.find((entry) => entry.id === nomineeId);
    return { ...nominee, status: "approved" } as unknown as T;
  }

  if (/^v1\/events\/.+\/admin\/nominations\/.+\/reject$/.test(path)) {
    const nomineeId = path.split("/")[5];
    const nominee = MOCK_ADMIN_NOMINEES.find((entry) => entry.id === nomineeId);
    return { ...nominee, status: "rejected" } as unknown as T;
  }

  if (/^v1\/events\/.+\/admin\/nominations\/.+\/set-category$/.test(path)) {
    const nomineeId = path.split("/")[5];
    const body = parseBody<{ categoryId?: string | null }>(options);
    const nominee = MOCK_ADMIN_NOMINEES.find((entry) => entry.id === nomineeId);
    return { ...nominee, categoryId: body.categoryId ?? null } as unknown as T;
  }

  // create nominee
  if (/^canhoes\/nominees$/.test(path)) {
    return {
      id: `nom-new-${Date.now()}`,
      categoryId: null,
      title: "Nova Nomeação",
      status: "pending",
      createdAtUtc: new Date().toISOString(),
    } as unknown as T;
  }

  // vote
  if (/^canhoes\/vote$/.test(path)) {
    return {
      id: `vote-${Date.now()}`,
      categoryId: "cat-001",
      nomineeId: "nom-001",
      updatedAtUtc: new Date().toISOString(),
    } as unknown as T;
  }

  // hub post create
  if (/^hub\/posts$/.test(path)) {
    return {
      id: `post-new-${Date.now()}`,
      authorUserId: "mock-admin-001",
      authorName: "Dev Admin",
      text: "Post de mock",
      mediaUrl: null,
      mediaUrls: [],
      isPinned: false,
      likedByMe: false,
      likeCount: 0,
      commentCount: 0,
      reactionCounts: {},
      myReactions: [],
      createdAtUtc: new Date().toISOString(),
      poll: null,
    } as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/feed\/posts$/.test(path)) {
    return {
      id: `event-post-${Date.now()}`,
      eventId: MOCK_EVENT_SUMMARY.id,
      userId: "mock-admin-001",
      userName: "Dev Admin",
      content: "Post de mock do evento",
      imageUrl: null,
      createdAt: new Date().toISOString(),
    } as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/votes$/.test(path)) {
    return {
      id: `event-vote-${Date.now()}`,
      userId: "mock-admin-001",
      categoryId: "cat-001",
      optionId: "nom-001",
      phaseId: "phase-voting",
    } as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/proposals$/.test(path)) {
    return {
      id: `event-proposal-${Date.now()}`,
      eventId: MOCK_EVENT_SUMMARY.id,
      userId: "mock-admin-001",
      content: "Nova proposta",
      status: "pending",
      createdAt: new Date().toISOString(),
    } as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/wishlist$/.test(path)) {
    return {
      id: `event-wishlist-${Date.now()}`,
      userId: "mock-admin-001",
      eventId: MOCK_EVENT_SUMMARY.id,
      title: "Novo item",
      link: null,
      updatedAt: new Date().toISOString(),
    } as unknown as T;
  }

  // default: empty success
  return undefined as unknown as T;
}

function handleRead<T>(path: string): T {
  if (path === `v1/events/${MOCK_EVENT_SUMMARY.id}/nominations/my-status`) {
    return MOCK_MY_NOMINATION_STATUS as unknown as T;
  }

  if (path.startsWith(`v1/events/${MOCK_EVENT_SUMMARY.id}/nominations/approved`)) {
    return MOCK_APPROVED_NOMINEES as unknown as T;
  }

  if (path === `v1/events/${MOCK_EVENT_SUMMARY.id}/official-voting`) {
    return MOCK_OFFICIAL_VOTING_BOARD as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/admin\/votes\/paged/.test(path)) {
    const { skip, take } = parsePagedQuery(path);
    const pagedVotes = MOCK_VOTES.votes.slice(skip, skip + take);
    return {
      total: MOCK_VOTES.votes.length,
      votes: pagedVotes,
      skip,
      take,
      hasMore: skip + pagedVotes.length < MOCK_VOTES.votes.length,
    } as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/admin\/nominations\/paged/.test(path)) {
    const { skip, take, url } = parsePagedQuery(path);
    const status = url.searchParams.get("status");
    const nominations = status
      ? MOCK_ADMIN_NOMINEES.filter((nominee) => nominee.status === status)
      : MOCK_ADMIN_NOMINEES;
    const pagedNominations = nominations.slice(skip, skip + take);
    return {
      total: nominations.length,
      nominations: pagedNominations,
      skip,
      take,
      hasMore: skip + pagedNominations.length < nominations.length,
    } as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/admin\/members\/paged/.test(path)) {
    const { skip, take } = parsePagedQuery(path);
    return paginateItems(MOCK_MEMBERS, skip, take) as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/admin\/official-results\/paged/.test(path)) {
    const { skip, take } = parsePagedQuery(path);
    return paginateItems(MOCK_ADMIN_OFFICIAL_RESULTS.categories, skip, take) as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/admin\/categories$/.test(path)) {
    return MOCK_CATEGORIES as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/admin\/categories\/summary/.test(path)) {
    return MOCK_CATEGORIES.map((category) => ({
      id: category.id,
      name: category.name,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      kind: category.kind,
    })) as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/admin\/nominees\/summary/.test(path)) {
    const url = new URL(`http://x/${path}`);
    const status = url.searchParams.get("status");
    return MOCK_NOMINEES
      .filter((nominee) => !status || nominee.status === status)
      .map((nominee) => ({
        id: nominee.id,
        categoryId: nominee.categoryId ?? null,
        title: nominee.title,
        status: nominee.status,
      })) as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/admin\/nominations\/summary/.test(path)) {
    const url = new URL(`http://x/${path}`);
    const status = url.searchParams.get("status");
    return MOCK_ADMIN_NOMINEES
      .filter((nominee) => !status || nominee.status === status)
      .map((nominee) => ({
        id: nominee.id,
        categoryId: nominee.categoryId ?? null,
        title: nominee.title,
        status: nominee.status,
        submittedByUserId: nominee.submittedByUserId,
        submittedByName: nominee.submittedByName,
      })) as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/admin\/category-proposals/.test(path)) {
    const { skip, take, url } = parsePagedQuery(path);
    const status = url.searchParams.get("status");
    const proposals = status
      ? MOCK_CATEGORY_PROPOSALS.filter((proposal) => proposal.status === status)
      : MOCK_CATEGORY_PROPOSALS;
    return paginateItems(proposals, skip, take) as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/admin\/measure-proposals/.test(path)) {
    const { skip, take, url } = parsePagedQuery(path);
    const status = url.searchParams.get("status");
    const proposals = status
      ? MOCK_MEASURE_PROPOSALS.filter((proposal) => proposal.status === status)
      : MOCK_MEASURE_PROPOSALS;
    return paginateItems(proposals, skip, take) as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/admin\/secret-santa\/state/.test(path)) {
    return {
      eventId: MOCK_EVENT_SUMMARY.id,
      eventCode: "canhoes2026",
      hasDraw: true,
      drawId: "draw-001",
      createdAtUtc: new Date(Date.now() - 86400000).toISOString(),
      isLocked: false,
      memberCount: MOCK_MEMBERS.length,
      assignmentCount: MOCK_MEMBERS.length,
    } as unknown as T;
  }

  if (path.startsWith(`v1/events/${MOCK_EVENT_SUMMARY.id}/admin/bootstrap`)) {
    return {
      events: [MOCK_EVENT_SUMMARY],
      state: {
        eventId: MOCK_EVENT_SUMMARY.id,
        activePhase: MOCK_EVENT_CONTEXT.activePhase ?? null,
        phases: MOCK_EVENT_CONTEXT.phases,
        nominationsVisible: true,
        resultsVisible: false,
        moduleVisibility: {
          feed: true,
          secretSanta: true,
          wishlist: true,
          categories: true,
          voting: true,
          gala: false,
          stickers: true,
          measures: true,
          nominees: true,
        },
        effectiveModules: {
          ...MOCK_EVENT_OVERVIEW.modules,
          voting: true,
        },
        counts: MOCK_EVENT_OVERVIEW.counts,
      },
      counts: {
        nomineesTotal: MOCK_NOMINEES.length,
        adminNomineesTotal: MOCK_ADMIN_NOMINEES.length,
        votesTotal: MOCK_VOTES.votes.length,
        categoryProposalsTotal: MOCK_CATEGORY_PROPOSALS.length,
        categoryProposalsPendingTotal: MOCK_CATEGORY_PROPOSALS.filter((proposal) => proposal.status === "pending").length,
        measureProposalsTotal: MOCK_MEASURE_PROPOSALS.length,
        measureProposalsPendingTotal: MOCK_MEASURE_PROPOSALS.filter((proposal) => proposal.status === "pending").length,
        membersTotal: MOCK_MEMBERS.length,
        officialResultsCategoriesCount: MOCK_ADMIN_OFFICIAL_RESULTS.categories.length,
      },
    } as unknown as T;
  }

  // canhoes state
  if (path === "canhoes/state") return MOCK_STATE as unknown as T;

  // categories (public)
  if (path === "canhoes/categories") {
    return MOCK_CATEGORIES.filter((c) => c.isActive) as unknown as T;
  }

  // nominees (public) – handle optional ?categoryId query
  if (path.startsWith("canhoes/nominees")) {
    const url = new URL(`http://x/${path}`);
    const catId = url.searchParams.get("categoryId");
    const approved = MOCK_NOMINEES.filter((n) => n.status === "approved");
    return (catId ? approved.filter((n) => n.categoryId === catId) : approved) as unknown as T;
  }

  // members
  if (path === "canhoes/members") return MOCK_MEMBERS as unknown as T;

  // my votes
  if (path === "canhoes/my-votes") return [] as unknown as T;
  if (path === "canhoes/my-user-votes") return [] as unknown as T;

  // wishlist
  if (path === "canhoes/wishlist") return [] as unknown as T;

  // measures (public)
  if (path === "canhoes/measures") return [] as unknown as T;

  // results
  if (path === "canhoes/results") return [] as unknown as T;

  // hub posts
  if (path === "hub/posts") return MOCK_HUB_POSTS as unknown as T;

  if (path === "v1/events") return [MOCK_EVENT_SUMMARY] as unknown as T;

  if (/^v1\/events\/[^/]+$/.test(path)) return MOCK_EVENT_CONTEXT as unknown as T;

  if (/^v1\/events\/[^/]+\/overview$/.test(path)) return MOCK_EVENT_OVERVIEW as unknown as T;

  if (/^v1\/events\/[^/]+\/voting\/overview$/.test(path)) {
    return MOCK_EVENT_VOTING_OVERVIEW as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/secret-santa\/overview$/.test(path)) {
    return MOCK_EVENT_SECRET_SANTA_OVERVIEW as unknown as T;
  }

  if (/^v1\/events\/[^/]+\/feed\/posts$/.test(path)) return MOCK_EVENT_POSTS as unknown as T;

  if (/^v1\/events\/[^/]+\/categories$/.test(path)) return MOCK_EVENT_CATEGORIES as unknown as T;

  if (/^v1\/events\/[^/]+\/voting$/.test(path)) return MOCK_EVENT_VOTING_BOARD as unknown as T;

  if (/^v1\/events\/[^/]+\/proposals$/.test(path)) return MOCK_EVENT_PROPOSALS as unknown as T;

  if (/^v1\/events\/[^/]+\/wishlist$/.test(path)) return MOCK_EVENT_WISHLIST as unknown as T;

  // hub comments
  if (/^hub\/posts\/.+\/comments$/.test(path)) return [] as unknown as T;

  // /api/me — mock user profile
  // Necessário para o useAuthCache em produção/mock
  if (path === "me") {
    return {
      user: {
        id: "mock-admin-001",
        email: "admin@dev.local",
        displayName: "Dev Admin",
        isAdmin: true,
      },
    } as unknown as T;
  }

  // fallback - retorna null para endpoints não mapeados
  return null as unknown as T;
}
