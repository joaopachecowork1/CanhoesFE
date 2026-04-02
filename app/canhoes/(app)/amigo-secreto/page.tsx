"use client";

import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { CanhoesSecretSantaModule } from "@/components/modules/canhoes/CanhoesSecretSantaModule";

export default function AmigoSecretoPage() {
  return (
    <EventModuleGate moduleKey="secretSanta">
      <CanhoesSecretSantaModule />
    </EventModuleGate>
  );
}
