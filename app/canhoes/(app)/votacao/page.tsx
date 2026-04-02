"use client";

import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { CanhoesVotingModule } from "@/components/modules/canhoes/CanhoesVotingModule";

export default function VotacaoPage() {
  return (
    <EventModuleGate moduleKey="voting">
      <CanhoesVotingModule />
    </EventModuleGate>
  );
}
