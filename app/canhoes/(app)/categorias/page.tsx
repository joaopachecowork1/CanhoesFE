"use client";

import { CanhoesCategoriesModule } from "@/components/modules/canhoes/CanhoesCategoriesModule";
import { ModuleAccessGuard } from "@/components/modules/canhoes/ModuleAccessGuard";

export default function CategoriasPage() {
  return (
    <ModuleAccessGuard moduleKey="categories">
      <CanhoesCategoriesModule />
    </ModuleAccessGuard>
  );
}
