"use client";

import { CanhoesStickerSubmitModule } from "@/components/modules/canhoes/CanhoesStickerSubmitModule";
import { ModuleAccessGuard } from "@/components/modules/canhoes/ModuleAccessGuard";

export default function StickersPage() {
  return (
    <ModuleAccessGuard moduleKey="stickers">
      <CanhoesStickerSubmitModule />
    </ModuleAccessGuard>
  );
}
