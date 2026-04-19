export type SessionDto = {
  id: string;
  userId: string;
  gameId: string;
  gameName: string;
  coverUrl?: string | null;
  released?: string | null;
  score?: number | null;
  platform?: string | null;
  startedAt: string; // ISO
  endedAt?: string | null; // ISO
  durationSeconds?: number | null;
  xpEarned?: number | null;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
};

export type BacklogGameDto = {
  userId: string;
  gameId: string;
  gameName: string;
  coverUrl?: string | null;
  released?: string | null;
  score?: number | null;
  totalPlaySeconds: number;
  totalXP: number;
  sessionsCount: number;
  lastPlayedAt?: string | null; // ISO
};

export type StartSessionRequest = {
  gameId: string;
  gameName: string;
  coverUrl?: string | null;
  released?: string | null;
  score?: number | null;
  platform?: string | null;
  startedAt?: string | null; // allow client to pass ISO; backend may ignore
};

export type StopSessionRequest = {
  endedAt?: string | null; // ISO
  /** Total seconds the session was paused. Sent to the server for accurate active play time. */
  pausedSeconds?: number | null;
};

export type CanhoesPhase = "nominations" | "voting" | "locked" | "gala";

export type CanhoesStateDto = {
  phase: CanhoesPhase;
  nominationsVisible: boolean;
  resultsVisible: boolean;
};

export type AwardCategoryDto = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  kind: "Sticker" | "UserVote";
  eligibleUsers?: PublicUserDto[];
  description?: string | null;
  voteQuestion?: string | null;
  voteRules?: string | null;
};

export type CreateAwardCategoryRequest = {
  name: string;
  sortOrder?: number | null;
  kind: "Sticker" | "UserVote";
  description?: string | null;
  voteQuestion?: string | null;
  voteRules?: string | null;
};
export type UserVoteDto = {
  id: string;
  categoryId: string;
  voterUserId: string;
  targetUserId: string;
  updatedAtUtc: string;
};

export type CastUserVoteRequest = {
  categoryId: string;
  targetUserId: string;
};

export type NomineeDto = {
  id: string;
  categoryId?: string | null;
  title: string;
  imageUrl?: string | null;
  status: "pending" | "approved" | "rejected";
  createdAtUtc: string;
  submittedByMe?: boolean;
};

export type AdminNomineeDto = NomineeDto & {
  submittedByUserId: string;
  submittedByName: string;
};

export type MyNominationStatusDto = {
  categoryId: string;
  hasNominated: boolean;
  nomineeId?: string;
  nomineeTitle?: string;
};

export type CreateNomineeRequest = {
  categoryId?: string | null;
  title: string;
  kind?: "nominees" | "stickers" | null;
};

export type CategoryProposalDto = {
  id: string;
  name: string;
  description?: string | null;
  status: "pending" | "approved" | "rejected";
  createdAtUtc: string;
};

export type UpdateAdminCategoryProposalRequest = {
  name?: string | null;
  description?: string | null;
  status?: "pending" | "approved" | "rejected" | null;
};

export type CreateCategoryProposalRequest = {
  name: string;
  description?: string | null;
};

export type GalaMeasureDto = {
  id: string;
  text: string;
  isActive: boolean;
  createdAtUtc: string;
};

export type MeasureProposalDto = {
  id: string;
  text: string;
  status: "pending" | "approved" | "rejected";
  createdAtUtc: string;
};

export type CreateMeasureProposalRequest = {
  text: string;
};

export type UpdateMeasureProposalRequest = {
  text?: string | null;
  status?: "pending" | "approved" | "rejected" | null;
};

export type PagedResultPublicUserDto = {
  items: PublicUserDto[];
  total: number;
  skip: number;
  take: number;
  hasMore: boolean;
};

export type PagedResultAdminNomineeDto = {
  items: AdminNomineeDto[];
  total: number;
  skip: number;
  take: number;
  hasMore: boolean;
};

export type PagedResultAdminCategoryResultDto = PagedResult<AdminCategoryResultDto>;

export type PendingAdminDto = {
  nominees: NomineeDto[];
  categoryProposals: CategoryProposalDto[];
  measureProposals: MeasureProposalDto[];
};

export type ProposalsByStatusDto<T> = {
  pending: T[];
  approved: T[];
  rejected: T[];
};

export type AdminProposalsHistoryDto = {
  categoryProposals: ProposalsByStatusDto<CategoryProposalDto>;
  measureProposals: ProposalsByStatusDto<MeasureProposalDto>;
};

export type SetNomineeCategoryRequest = {
  categoryId?: string | null;
};

export type AdminVoteAuditRowDto = {
  categoryId: string;
  categoryName: string;
  nomineeId: string;
  userId: string;
  userName: string;
  updatedAtUtc: string;
};

export type AdminVotesDto = {
  total: number;
  votes: AdminVoteAuditRowDto[];
};

export type CanhoesResultNomineeDto = {
  nomineeId: string;
  categoryId?: string | null;
  title: string;
  imageUrl?: string | null;
  votes: number;
};

export type CanhoesCategoryResultDto = {
  categoryId: string;
  categoryName: string;
  totalVotes: number;
  top: CanhoesResultNomineeDto[]; // top 3
};

export type VoteDto = {
  id: string;
  categoryId: string;
  nomineeId: string;
  updatedAtUtc: string;
};

export type CastVoteRequest = {
  categoryId: string;
  nomineeId: string;
};


export type PublicUserDto = {
  id: string;
  email: string;
  displayName?: string | null;
  isAdmin: boolean;
};

export type WishlistItemDto = {
  id: string;
  userId: string;
  title: string;
  url?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type CreateWishlistItemRequest = {
  title: string;
  url?: string | null;
  notes?: string | null;
};

export type SecretSantaDrawDto = {
  id: string;
  eventCode: string;
  createdAtUtc: string;
  isLocked: boolean;
};

export type SecretSantaMeDto = {
  drawId: string;
  eventCode: string;
  receiver: PublicUserDto;
};

export type CreateSecretSantaDrawRequest = {
  eventCode?: string | null;
};


// ------------------------------
// Hub / Feed
// ------------------------------

export type HubPostDto = {
  id: string;
  authorUserId: string;
  authorName: string;
  text: string;
  mediaUrl?: string | null;
  mediaUrls: string[];
  isPinned: boolean;
  likedByMe: boolean;
  likeCount: number;
  commentCount: number;
  downvoteCount: number;
  downvotedByMe: boolean;
  reactionCounts: Record<string, number>;
  myReactions: string[];
  createdAtUtc: string;

  poll?: HubPollDto | null;
};

export type HubPollOptionDto = {
  id: string;
  text: string;
  voteCount: number;
};

export type HubPollDto = {
  question: string;
  options: HubPollOptionDto[];
  myOptionId?: string | null;
  totalVotes: number;
};

export type HubCommentDto = {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  text: string;
  createdAtUtc: string;
  reactionCounts: Record<string, number>;
  myReactions: string[];
};

export type CreateHubPostRequest = {
  text: string;
  mediaUrl?: string | null;
  mediaUrls?: string[] | null;

  pollQuestion?: string | null;
  pollOptions?: string[] | null;
};

export type VotePollRequest = {
  optionId: string;
};

export type ToggleReactionRequest = {
  emoji: string;
};

export type CreateHubCommentRequest = {
  text: string;
};


// ------------------------------
// Admin helper types
// ------------------------------

export type UpdateAwardCategoryRequest = {
  name?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  kind?: string | null;
  description?: string | null;
  voteQuestion?: string | null;
  voteRules?: string | null;
};

// ------------------------------
// Events v1
// ------------------------------

export type EventSummaryDto = {
  id: string;
  name: string;
  isActive: boolean;
};

export type EventUserDto = {
  id: string;
  name: string;
  role: "admin" | "user";
};

export type EventPhaseDto = {
  id: string;
  type: "DRAW" | "PROPOSALS" | "VOTING" | "RESULTS";
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export type EventContextDto = {
  event: EventSummaryDto;
  users: EventUserDto[];
  phases: EventPhaseDto[];
  activePhase?: EventPhaseDto | null;
};

export type EventPermissionsDto = {
  isAdmin: boolean;
  isMember: boolean;
  canPost: boolean;
  canSubmitProposal: boolean;
  canVote: boolean;
  canManage: boolean;
};

export type EventCountsDto = {
  memberCount: number;
  feedPostCount: number;
  categoryCount: number;
  pendingProposalCount: number;
  wishlistItemCount: number;
};

export type EventModulesDto = {
  feed: boolean;
  secretSanta: boolean;
  wishlist: boolean;
  categories: boolean;
  voting: boolean;
  gala: boolean;
  stickers: boolean;
  measures: boolean;
  nominees: boolean;
  admin: boolean;
};

export type EventOverviewDto = {
  event: EventSummaryDto;
  activePhase?: EventPhaseDto | null;
  nextPhase?: EventPhaseDto | null;
  permissions: EventPermissionsDto;
  counts: EventCountsDto;
  hasSecretSantaDraw: boolean;
  hasSecretSantaAssignment: boolean;
  myWishlistItemCount: number;
  myProposalCount: number;
  myVoteCount: number;
  votingCategoryCount: number;
  modules: EventModulesDto;
};

export type EventAdminModuleVisibilityDto = {
  feed: boolean;
  secretSanta: boolean;
  wishlist: boolean;
  categories: boolean;
  voting: boolean;
  gala: boolean;
  stickers: boolean;
  measures: boolean;
  nominees: boolean;
};

export type EventAdminStateDto = {
  eventId: string;
  activePhase?: EventPhaseDto | null;
  phases: EventPhaseDto[];
  nominationsVisible: boolean;
  resultsVisible: boolean;
  moduleVisibility: EventAdminModuleVisibilityDto;
  effectiveModules: EventModulesDto;
  counts: EventCountsDto;
};

export type EventAdminBootstrapDto = {
  events: EventSummaryDto[];
  state: EventAdminStateDto;
  counts: AdminListCountsDto;
};

export type AdminListCountsDto = {
  nomineesTotal: number;
  adminNomineesTotal: number;
  votesTotal: number;
  categoryProposalsTotal: number;
  categoryProposalsPendingTotal: number;
  measureProposalsTotal: number;
  measureProposalsPendingTotal: number;
  membersTotal: number;
  officialResultsCategoriesCount: number;
};

export type PagedResult<T> = {
  items: T[];
  total: number;
  skip: number;
  take: number;
  hasMore: boolean;
};

export type AdminVotesPagedDto = {
  total: number;
  votes: AdminVoteAuditRowDto[];
  skip: number;
  take: number;
  hasMore: boolean;
};

export type AdminNomineesPagedDto = {
  total: number;
  nominations: AdminNomineeDto[];
  skip: number;
  take: number;
  hasMore: boolean;
};

export type AdminProposalsPagedDto = {
  categoryProposalsTotal: number;
  categoryProposals: ProposalsByStatusDto<CategoryProposalDto>;
  measureProposalsTotal: number;
  measureProposals: ProposalsByStatusDto<MeasureProposalDto>;
};


// Summary DTOs (lightweight for list views)
export type NomineeSummaryDto = {
  id: string;
  categoryId: string | null;
  title: string;
  status: string;
};

export type AwardCategorySummaryDto = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  kind: string;
};

export type AdminNomineeSummaryDto = {
  id: string;
  categoryId: string | null;
  title: string;
  status: string;
  submittedByUserId: string;
  submittedByName: string;
};

export type UpdateEventAdminStateRequest = {
  nominationsVisible?: boolean | null;
  resultsVisible?: boolean | null;
  moduleVisibility?: EventAdminModuleVisibilityDto | null;
};

export type AdminModuleKey =
  | "feed"
  | "secretSanta"
  | "wishlist"
  | "categories"
  | "voting"
  | "gala"
  | "stickers"
  | "measures"
  | "nominees";

export type AdminModuleDefinition = {
  key: AdminModuleKey;
  label: string;
  description: string;
  group: "community" | "core" | "finale";
  locked?: boolean;
};

export type UpdateEventModulesRequest = {
  modules: EventModulesDto;
};

export type UpdateEventPhaseRequest = {
  phaseType: EventPhaseDto["type"];
};

export type EventVotingOverviewDto = {
  eventId: string;
  phaseId?: string | null;
  canVote: boolean;
  endsAt?: string | null;
  categoryCount: number;
  submittedVoteCount: number;
  remainingVoteCount: number;
};

export type EventSecretSantaOverviewDto = {
  eventId: string;
  hasDraw: boolean;
  hasAssignment: boolean;
  drawEventCode?: string | null;
  assignedUser?: EventUserDto | null;
  assignedWishlistItemCount: number;
  myWishlistItemCount: number;
};

export type EventAdminSecretSantaStateDto = {
  eventId: string;
  eventCode: string;
  hasDraw: boolean;
  drawId?: string | null;
  createdAtUtc?: string | null;
  isLocked: boolean;
  memberCount: number;
  assignmentCount: number;
};

export type CreateEventSecretSantaDrawRequest = {
  eventCode?: string | null;
};

export type EventFeedPostDto = {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  content: string;
  imageUrl?: string | null;
  mediaUrls: string[];
  createdAt: string;
};

export type EventFeedPostFullDto = {
  id: string;
  eventId: string;
  authorUserId: string;
  authorName: string;
  text: string;
  mediaUrl?: string | null;
  mediaUrls: string[];
  isPinned: boolean;
  createdAtUtc: string;
  likeCount: number;
  commentCount: number;
  downvoteCount: number;
  reactionCounts: Record<string, number>;
  myReactions: string[];
  likedByMe: boolean;
  downvotedByMe: boolean;
  poll?: EventFeedPollDto | null;
};

export type EventFeedPollDto = {
  question: string;
  options: EventFeedPollOptionDto[];
  myOptionId?: string | null;
  totalVotes: number;
};

export type EventFeedPollOptionDto = {
  id: string;
  text: string;
  voteCount: number;
};

export type CreateEventPostRequest = {
  content: string;
  imageUrl?: string | null;
};

export type CreateEventFeedPostRequest = {
  text: string;
  mediaUrl?: string | null;
  mediaUrls?: string[] | null;
  pollQuestion?: string | null;
  pollOptions?: string[] | null;
};

export type CreateFeedCommentRequest = {
  text: string;
};

export type ToggleFeedReactionRequest = {
  emoji?: string | null;
};

export type EventCategoryDto = {
  id: string;
  eventId: string;
  title: string;
  kind: "Sticker" | "UserVote";
  isActive: boolean;
  description?: string | null;
};

export type CreateEventCategoryRequest = {
  title: string;
  description?: string | null;
  kind: "Sticker" | "UserVote";
  sortOrder?: number | null;
};

export type EventVoteOptionDto = {
  id: string;
  categoryId: string;
  label: string;
};

export type EventVotingCategoryDto = {
  id: string;
  eventId: string;
  title: string;
  kind: "Sticker" | "UserVote";
  description?: string | null;
  voteQuestion?: string | null;
  options: EventVoteOptionDto[];
  myOptionId?: string | null;
};

export type EventVotingBoardDto = {
  eventId: string;
  phaseId?: string | null;
  canVote: boolean;
  categories: EventVotingCategoryDto[];
};

export type OfficialVotingOptionDto = {
  id: string;
  label: string;
  imageUrl?: string | null;
  voteCount?: number | null;
};

export type OfficialVotingCategoryDto = {
  id: string;
  title: string;
  description?: string | null;
  kind: "Sticker" | "UserVote";
  nominees: OfficialVotingOptionDto[];
  myNomineeId?: string | null;
  totalVotes?: number | null;
};

export type OfficialVotingBoardDto = {
  eventId: string;
  phaseId?: string | null;
  canVote: boolean;
  endsAt?: string | null;
  resultsVisible?: boolean;
  categories: OfficialVotingCategoryDto[];
};

export type CastOfficialVoteRequest = {
  categoryId: string;
  nomineeId: string;
};

export type OfficialVoteDto = {
  id: string;
  userId: string;
  categoryId: string;
  nomineeId: string;
  phaseId: string;
  updatedAtUtc: string;
};

export type AdminNomineeVoteTallyDto = {
  nomineeId: string;
  nomineeTitle: string;
  imageUrl?: string | null;
  voteCount: number;
  voterUserIds: string[];
};

export type AdminCategoryResultDto = {
  categoryId: string;
  categoryName: string;
  totalVotes: number;
  nominees: AdminNomineeVoteTallyDto[];
  participationRate: number;
};

export type AdminOfficialResultsDto = {
  eventId: string;
  generatedAt: string;
  totalMembers: number;
  categories: AdminCategoryResultDto[];
};

export type CreateEventVoteRequest = {
  categoryId: string;
  optionId: string;
};

export type EventVoteDto = {
  id: string;
  userId: string;
  categoryId: string;
  optionId: string;
  phaseId: string;
};

export type EventProposalDto = {
  id: string;
  eventId: string;
  userId: string;
  name: string;
  description?: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type CreateEventProposalRequest = {
  name: string;
  description?: string | null;
};

export type UpdateEventProposalRequest = {
  status: "pending" | "approved" | "rejected";
};

export type EventWishlistItemDto = {
  id: string;
  userId: string;
  eventId: string;
  title: string;
  link?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  updatedAt: string;
};

export type CreateEventWishlistItemRequest = {
  title: string;
  link?: string | null;
  notes?: string | null;
};

// ─── Feed interaction types (placeholders — will be generated when BE endpoints exist) ───

export type FeedCommentDto = {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAtUtc: string;
};

export type FeedReactionDto = {
  emoji: string;
  count: number;
};

export type FeedPollVoteDto = {
  optionId: string;
  voteCount: number;
};
