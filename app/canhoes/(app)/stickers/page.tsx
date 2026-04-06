import dynamic from "next/dynamic";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";

const CanhoesStickerSubmitModule = dynamic(
  () => import("@/components/modules/canhoes/CanhoesStickerSubmitModule").then((m) => ({ default: m.CanhoesStickerSubmitModule })),
  { loading: () => <FeedSkeleton /> }
);

export default function StickersPage() {
  return <CanhoesStickerSubmitModule />;
}
