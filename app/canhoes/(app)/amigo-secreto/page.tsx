"use client";

import { CanhoesSecretSantaModule } from "@/components/modules/canhoes/CanhoesSecretSantaModule";
import { ModuleAccessGuard } from "@/components/modules/canhoes/ModuleAccessGuard";

export default function AmigoSecretoPage() {
  return (
    <ModuleAccessGuard moduleKey="secretSanta">
      <CanhoesSecretSantaModule />
    </ModuleAccessGuard>
  );
}
