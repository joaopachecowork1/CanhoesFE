export type EventSummaryDto = {
  id: string;
  name: string;
  isActive: boolean;
};

export type EventPhaseDto = {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
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

export type AdminModuleKey = keyof Pick<EventModulesDto, "feed" | "secretSanta" | "wishlist" | "categories" | "voting" | "gala" | "stickers" | "measures" | "nominees">;

export type EventOverviewDto = {
  event: EventSummaryDto;
  activePhase: EventPhaseDto | null;
  nextPhase: EventPhaseDto | null;
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

export type EventUserDto = {
  id: string;
  name: string;
  role: string;
};

export type PublicUserDto = {
  id: string;
  name: string;
  displayName: string;
  email?: string;
  avatarUrl: string | null;
  isAdmin?: boolean;
};

export type EventVotingOverviewDto = {
  eventId: string;
  phaseId: string | null;
  canVote: boolean;
  endsAt: string | null;
  categoryCount: number;
  submittedVoteCount: number;
  remainingVoteCount: number;
};

export type OfficialVotingCategoryDto = {
  id: string;
  title: string;
  description?: string | null;
  kind?: string;
  nominees: Array<{ id: string; label: string; voteCount?: number }>;
  myNomineeId: string | null;
  totalVotes: number;
};

export type OfficialVotingBoardDto = {
  eventId: string;
  phaseId?: string | null;
  endsAt?: string | null;
  categories: OfficialVotingCategoryDto[];
  canVote: boolean;
};

export type CastOfficialVoteRequest = {
  categoryId: string;
  nomineeId: string;
};

export type EventWishlistItemDto = {
  id: string;
  userId: string;
  title: string;
  url: string | null;
  link?: string | null;
  notes: string | null;
  imageUrl: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
  updatedAt?: string;
};

export type EventSecretSantaOverviewDto = {
  eventId: string;
  hasDraw: boolean;
  hasAssignment: boolean;
  drawEventCode: string | null;
  assignedUser: EventUserDto | null;
  assignedWishlistItemCount: number;
  myWishlistItemCount: number;
};

export type EventFeedPollOptionDto = {
  id: string;
  text: string;
  voteCount: number;
};

export type EventFeedPollDto = {
  question: string;
  options: EventFeedPollOptionDto[];
  myOptionId: string | null;
  totalVotes: number;
};

export type EventCategoryDto = {
  id: string;
  eventId?: string;
  title?: string;
  name: string;
  description: string | null;
  isActive: boolean;
  kind?: string;
  sortOrder?: number;
  voteQuestion?: string | null;
  voteRules?: string | null;
};

export type EventFeedPostFullDto = {
  id: string;
  eventId: string;
  authorUserId: string;
  authorName: string;
  text: string;
  mediaUrl: string | null;
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
  poll: EventFeedPollDto | null;
};

export type CreateEventFeedPostRequest = {
  content?: string;
  text?: string;
  mediaUrl?: string | null;
  mediaUrls?: string[] | null;
  pollQuestion?: string | null;
  pollOptions?: string[] | null;
};

export type EventActiveContextDto = {
  event: EventSummaryDto;
  overview: EventOverviewDto;
};

export type EventHomeSnapshotDto = {
  event: EventSummaryDto;
  overview: EventOverviewDto;
  voting: EventVotingOverviewDto;
  secretSanta: EventSecretSantaOverviewDto;
  recentPosts: EventFeedPostFullDto[];
};

export type ProposalStatus = "pending" | "approved" | "rejected";

export type CategoryProposalDto = {
  id: string;
  name: string;
  description: string | null;
  status: ProposalStatus;
  createdAtUtc: string;
};

export type MeasureProposalDto = {
  id: string;
  text: string;
  status: ProposalStatus;
  createdAtUtc: string;
};

export type GalaMeasureDto = {
  id: string;
  text: string;
  isActive: boolean;
  createdAtUtc: string;
};

export type NomineeDto = {
  id: string;
  categoryId: string | null;
  title: string;
  label?: string;
  kind?: string;
  imageUrl: string | null;
  status: ProposalStatus;
  createdAtUtc: string;
  voteCount?: number;
};

export type NomineeSummaryDto = {
  id: string;
  categoryId: string | null;
  title: string;
  status: ProposalStatus;
};

export type MyNominationStatusDto = {
  categoryId?: string;
  hasNominated?: boolean;
  hasNomination?: boolean;
  status?: ProposalStatus | null;
  nomineeId?: string | null;
  nomineeTitle?: string | null;
};

export type AdminNomineeDto = {
  id: string;
  categoryId: string | null;
  title: string;
  imageUrl: string | null;
  status: ProposalStatus;
  createdAtUtc: string;
  submittedByUserId: string;
  submittedByName: string;
  submittedByMe?: boolean;
};

export type AdminMemberDto = {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
};

export type AwardCategoryDto = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  kind: string;
  description: string | null;
  voteQuestion: string | null;
  voteRules: string | null;
};

export type CreateAwardCategoryRequest = {
  name: string;
  sortOrder?: number | null;
  kind: string;
  description?: string | null;
  voteQuestion?: string | null;
  voteRules?: string | null;
};

export type UpdateAwardCategoryRequest = {
  name?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  kind?: string | null;
  description?: string | null;
  voteQuestion?: string | null;
  voteRules?: string | null;
};

export type AdminCategoryNomineeResultDto = {
  nomineeId: string;
  title: string;
  imageUrl: string | null;
  voteCount: number;
  voterUserIds: string[];
};

export type AdminVoteAuditRowDto = {
  categoryId: string;
  categoryName: string;
  nomineeId: string;
  userId: string;
  userName: string;
  updatedAtUtc: string;
};

export type HubPollOptionDto = {
  id: string;
  text: string;
  voteCount: number;
};

export type HubPollDto = {
  question: string;
  options: HubPollOptionDto[];
  myOptionId: string | null;
  totalVotes: number;
};

export type HubCommentDto = {
  id: string;
  postId: string;
  authorId: string;
  userId?: string;
  authorName: string;
  userName?: string;
  text: string;
  createdAtUtc: string;
  reactionCounts?: Record<string, number>;
  myReactions?: string[];
};

export type AdminCategoryResultDto = {
  categoryId: string;
  categoryName: string;
  totalVotes: number;
  nominees: AdminCategoryNomineeResultDto[];
  participationRate: number;
  top: AdminCategoryNomineeResultDto[];
};

export type CanhoesCategoryResultDto = AdminCategoryResultDto;

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
  activePhase: EventPhaseDto | null;
  phases: EventPhaseDto[];
  nominationsVisible: boolean;
  resultsVisible: boolean;
  moduleVisibility: EventAdminModuleVisibilityDto;
  effectiveModules: EventModulesDto;
  counts: EventCountsDto;
};

export type EventAdminSecretSantaStateDto = {
  eventId: string;
  eventCode: string;
  hasDraw: boolean;
  drawId: string | null;
  createdAtUtc: string | null;
  isLocked: boolean;
  memberCount: number;
  assignmentCount: number;
};

export type CanhoesStateDto = {
  phase: string;
  nominationsVisible: boolean;
  resultsVisible: boolean;
};

export type EventContextDto = {
  event: EventSummaryDto;
  users: EventUserDto[];
  phases: EventPhaseDto[];
  activePhase: EventPhaseDto | null;
};

export type EventFeedPostDto = {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  content: string;
  imageUrl: string | null;
  mediaUrls: string[];
  createdAt: string;
};

export type EventProposalDto = {
  id: string;
  eventId: string;
  userId: string;
  name: string;
  description: string | null;
  status: ProposalStatus;
  createdAt: string;
};

export type EventVotingBoardDto = {
  eventId: string;
  phaseId: string | null;
  canVote: boolean;
  categories: Array<{
    id: string;
    eventId: string;
    title: string;
    kind: string;
    description: string | null;
    voteQuestion: string | null;
    options: Array<{ id: string; categoryId: string; label: string }>;
    myOptionId: string | null;
  }>;
};

export type AdminOfficialResultsDto = {
  eventId: string;
  generatedAt: string;
  totalMembers: number;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    totalVotes: number;
    participationRate: number;
    nominees: Array<{
      nomineeId: string;
      nomineeTitle: string;
      voteCount: number;
      voterUserIds: string[];
    }>;
  }>;
};

export type EventAdminBootstrapDto = {
  event: EventSummaryDto;
  adminState: EventAdminStateDto;
  secretSantaState: EventAdminSecretSantaStateDto;
};
