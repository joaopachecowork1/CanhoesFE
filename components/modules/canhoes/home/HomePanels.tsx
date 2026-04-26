"use client";

import { memo } from "react";
import { MessageSquare, Gift, Vote, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VirtualizedList } from "@/components/ui/virtualized-list";
import { SectionBoundary } from "@/components/ui/section-boundary";
import { homeCopy as homeCopyText } from "@/lib/canhoesCopy";
import { openComposeSheet } from "@/lib/canhoesEvent";
import { cn } from "@/lib/utils";

import { FeedPostCard, SecretSantaStateCard } from "./HomeFeedCard";
import { ChecklistItem } from "./HomeCards";
import type { CanhoesEventHomeViewModel } from "./useCanhoesEventHome";

const PANEL_CARD_CLASS = "rounded-[var(--radius-lg-token)] border border-[var(--border-paper)] bg-[var(--bg-paper)] text-[var(--ink-primary)] shadow-[var(--shadow-paper)]";

type HomeAction = CanhoesEventHomeViewModel["homeCopy"]["primaryAction"];
type RecentPost = CanhoesEventHomeViewModel["recentPosts"][number];
type ChecklistItemData = { done: boolean; hint?: string; label: string };

export const HomeFeedPanel = memo(function HomeFeedPanel({ posts }: { posts: RecentPost[] }) {
  const feedContent =
    posts.length === 0 ? (
      <div className="rounded-[var(--radius-md-token)] border border-[var(--border-paper)] bg-[var(--bg-paper-soft)] px-3 py-4 text-sm text-[var(--ink-primary)] shadow-none">
        {homeCopyText.emptyFeed}
      </div>
    ) : posts.length > 20 ? (
      <VirtualizedList
        useWindowScroll
        items={posts}
        getKey={(post) => post.id}
        estimateSize={() => 308}
        overscan={4}
        className="relative"
        renderItem={(post) => <FeedPostCard post={post} />}
      />
    ) : (
      posts.map((post) => <FeedPostCard key={post.id} post={post} />)
    );

  return (
    <HomePanel
      title="Mural social da edicao"
      icon={MessageSquare}
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={openComposeSheet}>
            Publicar no mural
          </Button>
        </div>
      }
    >
      {feedContent}
    </HomePanel>
  );
});

export const HomeSecretSantaPanel = memo(function HomeSecretSantaPanel({
  assignedWishlistItemCount,
  assignedUserName,
  hasAssignment,
  hasDraw,
  secretSantaAction,
  wishlistAction,
}: {
  assignedWishlistItemCount: number;
  assignedUserName?: string;
  hasAssignment: boolean;
  hasDraw: boolean;
  secretSantaAction: HomeAction;
  wishlistAction: HomeAction;
}) {
  return (
    <HomePanel title={homeCopyText.secretSantaTitle} icon={Gift}>
      <SecretSantaStateCard
        assignedWishlistItemCount={assignedWishlistItemCount}
        assignedUserName={assignedUserName}
        hasAssignment={hasAssignment}
        hasDraw={hasDraw}
      />
      <div className="grid gap-2 sm:grid-cols-2 text-sm font-medium">
        {/* Placeholder logic for buttons since HomeActions are elsewhere */}
        <a href={secretSantaAction.href} className="inline-flex items-center justify-center rounded-md border px-4 py-2 hover:bg-accent">{secretSantaAction.label}</a>
        <a href={wishlistAction.href} className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80">{wishlistAction.label}</a>
      </div>
    </HomePanel>
  );
});

export const HomeChecklistPanel = memo(function HomeChecklistPanel({ items }: { items: ChecklistItemData[] }) {
  return (
    <HomePanel title={homeCopyText.checklistTitle} icon={Vote}>
      {items.map((item) => (
        <ChecklistItem key={item.label} {...item} />
      ))}
    </HomePanel>
  );
});

const HomePanel = memo(function HomePanel({
  cardClassName,
  children,
  footer,
  icon: Icon,
  title,
}: {
  cardClassName?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <Card className={cn(PANEL_CARD_CLASS, cardClassName)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-[var(--ink-primary)]">
          <Icon className="h-4 w-4 text-[var(--moss)]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
        {footer}
      </CardContent>
    </Card>
  );
});
