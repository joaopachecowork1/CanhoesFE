"use client";

import { CanhoesMeasuresModule } from "@/components/modules/canhoes/CanhoesMeasuresModule";
import { ModuleAccessGuard } from "@/components/modules/canhoes/ModuleAccessGuard";

export default function MedidasPage() {
  return (
    <ModuleAccessGuard moduleKey="measures">
      <CanhoesMeasuresModule />
    </ModuleAccessGuard>
  );
}
