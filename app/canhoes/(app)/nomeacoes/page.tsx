"use client";

import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { CanhoesNomineesModule } from "@/components/modules/canhoes/CanhoesNomineesModule";
import { ModuleAccessGuard } from "@/components/modules/canhoes/ModuleAccessGuard";

export default function NomeacoesPage() {
  return (
    <EventModuleGate moduleKey="nominees">
      <CanhoesNomineesModule />
    </EventModuleGate>
  );
}
