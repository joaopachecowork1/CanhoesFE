"use client";

import dynamic from "next/dynamic";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";

const CanhoesOfficialVotingModule = dynamic(
  () => import("@/components/modules/canhoes/CanhoesOfficialVotingModule").then((m) => ({ default: m.CanhoesOfficialVotingModule })),
  { loading: () => <FeedSkeleton /> }
);

export default function VotacaoPage() {
  return (
    <div className="zone-voting">
      <EventModuleGate moduleKey="voting">
        <CanhoesOfficialVotingModule />
      </EventModuleGate>
    </div>
  );
}
