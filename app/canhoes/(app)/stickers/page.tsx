import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { CanhoesStickerSubmitModule } from "@/components/modules/canhoes/CanhoesStickerSubmitModule";
import { ModuleAccessGuard } from "@/components/modules/canhoes/ModuleAccessGuard";

export default function StickersPage() {
  return (
    <EventModuleGate moduleKey="stickers">
      <CanhoesStickerSubmitModule />
    </EventModuleGate>
  );
}
