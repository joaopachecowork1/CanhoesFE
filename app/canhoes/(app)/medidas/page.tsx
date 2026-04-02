"use client";

import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { CanhoesMeasuresModule } from "@/components/modules/canhoes/CanhoesMeasuresModule";
import { ModuleAccessGuard } from "@/components/modules/canhoes/ModuleAccessGuard";

export default function MedidasPage() {
  return (
    <EventModuleGate moduleKey="measures">
      <CanhoesMeasuresModule />
    </EventModuleGate>
  );
}
