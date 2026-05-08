"use client";

import { Camera, Pin, ScrollText, Vote } from "lucide-react";

import { feedCopy } from "@/lib/canhoesCopy";
import type { EventFeedPostFullDto } from "@/lib/api/types";

import { MetricCard } from "@/components/modules/canhoes/home/HomeCards";

function getPostMediaCount(post: {
  mediaUrl?: string | null;
  mediaUrls?: string[] | null;
}) {
  return new Set([...(post.mediaUrls ?? []), post.mediaUrl].filter(Boolean)).size;
}

export function FeedInsightsPanel({
  posts,
}: Readonly<{
  posts: readonly EventFeedPostFullDto[];
}>) {
  let pinnedPostCount = 0;
  let postsWithMediaCount = 0;
  let postsWithPollCount = 0;

  for (const post of posts) {
    if (post.isPinned) pinnedPostCount += 1;
    if (getPostMediaCount(post) > 0) postsWithMediaCount += 1;
    if (post.poll) postsWithPollCount += 1;
  }

  return (
    <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
      <MetricCard
        label={feedCopy.insights.archive.label}
        value={posts.length}
        hint={feedCopy.insights.archive.description}
        icon={<ScrollText className="h-4 w-4" />}
      />
      <MetricCard
        label={feedCopy.insights.media.label}
        value={postsWithMediaCount}
        hint={feedCopy.insights.media.description}
        icon={<Camera className="h-4 w-4" />}
      />
      <MetricCard
        label={feedCopy.insights.polls.label}
        value={postsWithPollCount}
        hint={feedCopy.insights.polls.description}
        icon={<Vote className="h-4 w-4" />}
        tone="purple"
      />
      <MetricCard
        label={feedCopy.insights.pinned.label}
        value={pinnedPostCount}
        hint={feedCopy.insights.pinned.description}
        icon={<Pin className="h-4 w-4" />}
      />
    </aside>
  );
}
