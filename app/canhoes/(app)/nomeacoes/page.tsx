"use client";

import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { CanhoesNominationsModule } from "@/components/modules/canhoes/CanhoesNominationsModule";

export default function NomeacoesPage() {
  return (
    <EventModuleGate moduleKey="nominees">
      <CanhoesNominationsModule />
    </EventModuleGate>
  );
}
