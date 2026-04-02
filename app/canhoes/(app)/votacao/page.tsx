"use client";

import { CanhoesVotingModule } from "@/components/modules/canhoes/CanhoesVotingModule";
import { ModuleAccessGuard } from "@/components/modules/canhoes/ModuleAccessGuard";

export default function VotacaoPage() {
  return (
    <ModuleAccessGuard moduleKey="voting">
      <CanhoesVotingModule />
    </ModuleAccessGuard>
  );
}
