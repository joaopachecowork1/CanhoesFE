"use client";

import dynamic from "next/dynamic";
import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";

const CanhoesMeasuresModule = dynamic(
  () => import("@/components/modules/canhoes/CanhoesMeasuresModule").then((m) => ({ default: m.CanhoesMeasuresModule })),
  { loading: () => <FeedSkeleton /> }
);

export default function MeasuresPage() {
  return (
    <EventModuleGate moduleKey="measures">
      <CanhoesMeasuresModule />
    </EventModuleGate>
  );
}
