"use client";

import { redirect } from "next/navigation";

import { CanhoesGalaModule } from "@/components/modules/canhoes/CanhoesGalaModule";
import { ModuleAccessGuard } from "@/components/modules/canhoes/ModuleAccessGuard";
import { IS_LOCAL_MODE } from "@/lib/mock";

export default function GalaPage() {
  if (IS_LOCAL_MODE) {
    redirect("/canhoes");
  }

  return (
    <ModuleAccessGuard moduleKey="gala">
      <CanhoesGalaModule />
    </ModuleAccessGuard>
  );
}
