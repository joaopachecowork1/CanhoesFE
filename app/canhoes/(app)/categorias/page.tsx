"use client";

import { useEffect } from "react";
import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { CanhoesCategoriesModule } from "@/components/modules/canhoes/CanhoesCategoriesModule";

export default function CategoriasPage() {
  useEffect(() => {
    document.title = "Categorias";
  }, []);

  return (
    <EventModuleGate moduleKey="categories">
      <CanhoesCategoriesModule />
    </EventModuleGate>
  );
}
