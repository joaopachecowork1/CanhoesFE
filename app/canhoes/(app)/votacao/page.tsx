"use client";

import { useEventOverview } from "@/hooks/useEventOverview";
import { Card, CardContent } from "@/components/ui/card";
import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { CanhoesOfficialVotingModule } from "@/components/modules/canhoes/CanhoesOfficialVotingModule";
import { CanhoesVotingModule } from "@/components/modules/canhoes/CanhoesVotingModule";

export default function VotacaoPage() {
  const { overview } = useEventOverview();

  const showOfficialVoting =
    overview?.modules?.voting && overview?.activePhase?.type === "VOTING";

  return (
    <EventModuleGate moduleKey="voting">
      {showOfficialVoting ? (
        <div className="space-y-4">
          <Card className="border-[var(--border-neon)] bg-[rgba(0,255,136,0.05)] rounded-2xl">
            <CardContent className="py-4 text-sm font-semibold text-[var(--neon-green)]">
              🗳️ Votacao Oficial · Canhoes do Ano
            </CardContent>
          </Card>
          <CanhoesOfficialVotingModule />
        </div>
      ) : (
        <CanhoesVotingModule />
      )}
    </EventModuleGate>
  );
}
