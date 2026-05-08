import dynamic from "next/dynamic";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import { EventModuleGate } from "@/components/modules/canhoes/shared/EventModuleGate";

const CanhoesStickerSubmitModule = dynamic(
  () => import("@/components/modules/canhoes/stickers/CanhoesStickerSubmitModule").then((m) => ({ default: m.CanhoesStickerSubmitModule })),
  { loading: () => <FeedSkeleton /> }
);

export default function StickersPage() {
  return (
    <EventModuleGate moduleKey="stickers">
      <CanhoesStickerSubmitModule />
    </EventModuleGate>
  );
}
