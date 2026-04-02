"use client";

import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { CanhoesNomineesModule } from "@/components/modules/canhoes/CanhoesNomineesModule";

export default function NomeacoesPage() {
  return (
    <EventModuleGate moduleKey="nominees">
      <CanhoesNomineesModule />
    </EventModuleGate>
  );
}
