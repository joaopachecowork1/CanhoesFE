"use client";

import { CanhoesNomineesModule } from "@/components/modules/canhoes/CanhoesNomineesModule";
import { ModuleAccessGuard } from "@/components/modules/canhoes/ModuleAccessGuard";

export default function NomeacoesPage() {
  return (
    <ModuleAccessGuard moduleKey="nominees">
      <CanhoesNomineesModule />
    </ModuleAccessGuard>
  );
}
