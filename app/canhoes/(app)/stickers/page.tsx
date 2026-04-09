import dynamic from "next/dynamic";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";

const CanhoesStickerSubmitModule = dynamic(
  () => import("@/components/modules/canhoes/CanhoesStickerSubmitModule").then((m) => ({ default: m.CanhoesStickerSubmitModule })),
  { loading: () => <FeedSkeleton /> }
);

export default function StickersPage() {
  return (
    <EventModuleGate moduleKey="stickers">
      <CanhoesStickerSubmitModule />
    </EventModuleGate>
  );
}
