"use client";

import dynamic from "next/dynamic";
import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";

const HubFeedModule = dynamic(
  () => import("@/components/modules/hub/HubFeedModule").then((m) => ({ default: m.HubFeedModule })),
  { loading: () => <FeedSkeleton /> }
);

export default function CanhoesFeedPage() {
  return (
    <div className="zone-feed">
      <EventModuleGate moduleKey="feed">
        <HubFeedModule showComposer={false} />
      </EventModuleGate>
    </div>
  );
}
