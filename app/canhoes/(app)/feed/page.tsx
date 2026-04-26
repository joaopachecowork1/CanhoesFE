import dynamic from "next/dynamic";
import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import { canhoesServerFetch } from "@/lib/api/canhoesServerClient";
import type { EventFeedPostFullDto } from "@/lib/api/types";

const HubFeedModule = dynamic(
  () => import("@/components/modules/hub/HubFeedModule").then((m) => ({ default: m.HubFeedModule })),
  { loading: () => <FeedSkeleton /> }
);

type FeedApiResponse = {
  items: EventFeedPostFullDto[];
  total: number;
  skip: number;
  take: number;
  hasMore: boolean;
};

export default async function CanhoesFeedPage() {
  const firstPage = await canhoesServerFetch<FeedApiResponse>("events/active/feed?skip=0&take=15");
  
  const initialData = firstPage ? {
    pages: [{
      posts: firstPage.items,
      nextCursor: firstPage.hasMore ? 1 : null
    }],
    pageParams: [0]
  } : undefined;

  return (
    <div className="zone-feed">
      <EventModuleGate moduleKey="feed">
        <HubFeedModule showComposer={false} initialData={initialData} />
      </EventModuleGate>
    </div>
  );
}
