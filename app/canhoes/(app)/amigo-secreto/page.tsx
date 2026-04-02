"use client";

import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { CanhoesSecretSantaModule } from "@/components/modules/canhoes/CanhoesSecretSantaModule";
import { ModuleAccessGuard } from "@/components/modules/canhoes/ModuleAccessGuard";

export default function AmigoSecretoPage() {
  return (
    <EventModuleGate moduleKey="secretSanta">
      <CanhoesSecretSantaModule />
    </EventModuleGate>
  );
}
