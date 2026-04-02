"use client";

import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { CanhoesCategoriesModule } from "@/components/modules/canhoes/CanhoesCategoriesModule";
import { ModuleAccessGuard } from "@/components/modules/canhoes/ModuleAccessGuard";

export default function CategoriasPage() {
  return (
    <EventModuleGate moduleKey="categories">
      <CanhoesCategoriesModule />
    </EventModuleGate>
  );
}
