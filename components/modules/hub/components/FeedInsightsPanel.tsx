"use client";

import type { ReactNode } from "react";
import { Camera, Pin, ScrollText, Vote } from "lucide-react";

import { feedCopy } from "@/lib/canhoesCopy";
import type { HubPostDto } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";

function getPostMediaCount(post: {
  mediaUrl?: string | null;
  mediaUrls?: string[] | null;
}) {
  return Array.from(
    new Set([...(post.mediaUrls ?? []), post.mediaUrl].filter(Boolean))
  ).length;
}

export function FeedInsightsPanel({
  posts,
}: Readonly<{
  posts: readonly HubPostDto[];
}>) {
  const pinnedPostCount = posts.filter((post) => post.isPinned).length;
  const postsWithMediaCount = posts.filter((post) => getPostMediaCount(post) > 0).length;
  const postsWithPollCount = posts.filter((post) => Boolean(post.poll)).length;

  return (
    <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
      <FeedInsightCard
        label={feedCopy.insights.archive.label}
        value={posts.length}
        description={feedCopy.insights.archive.description}
        icon={<ScrollText className="h-4 w-4" />}
      />
      <FeedInsightCard
        label={feedCopy.insights.media.label}
        value={postsWithMediaCount}
        description={feedCopy.insights.media.description}
        icon={<Camera className="h-4 w-4" />}
      />
      <FeedInsightCard
        label={feedCopy.insights.polls.label}
        value={postsWithPollCount}
        description={feedCopy.insights.polls.description}
        icon={<Vote className="h-4 w-4" />}
        tone="purple"
      />
      <FeedInsightCard
        label={feedCopy.insights.pinned.label}
        value={pinnedPostCount}
        description={feedCopy.insights.pinned.description}
        icon={<Pin className="h-4 w-4" />}
      />
    </aside>
  );
}

function FeedInsightCard({
  description,
  icon,
  label,
  tone = "green",
  value,
}: Readonly<{
  description: string;
  icon: ReactNode;
  label: string;
  tone?: "green" | "purple";
  value: number;
}>) {
  const iconClassName =
    tone === "purple"
      ? "border-[rgba(177,140,255,0.24)] bg-[linear-gradient(180deg,rgba(36,28,53,0.96),rgba(20,16,32,0.96))] text-[var(--accent-purple-soft)] [box-shadow:var(--glow-purple-sm)]"
      : "border-[rgba(0,255,136,0.18)] bg-[rgba(47,56,26,0.92)] text-[var(--neon-green)] shadow-[var(--glow-green-sm)]";

  return (
    <Card className="canhoes-paper-card rounded-[var(--radius-lg-token)] text-[var(--text-dark)]">
      <CardContent className="space-y-3 px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="editorial-kicker text-[var(--text-muted)]">{label}</p>
            <p className="heading-2 text-[var(--text-dark)]">{value}</p>
          </div>
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-[var(--shadow-card)] ${iconClassName}`}
          >
            {icon}
          </span>
        </div>
        <p className="body-small text-[var(--text-muted)]">{description}</p>
      </CardContent>
    </Card>
  );
}
