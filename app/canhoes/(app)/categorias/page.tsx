"use client";

import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { CanhoesCategoriesModule } from "@/components/modules/canhoes/CanhoesCategoriesModule";

export default function CategoriasPage() {
  return (
    <EventModuleGate moduleKey="categories">
      <CanhoesCategoriesModule />
    </EventModuleGate>
  );
}
