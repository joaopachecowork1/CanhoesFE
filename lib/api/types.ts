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
