import dynamic from "next/dynamic";
import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";

const CanhoesWishlistModule = dynamic(
  () => import("@/components/modules/canhoes/CanhoesWishlistModule").then((m) => ({ default: m.CanhoesWishlistModule })),
  { loading: () => <FeedSkeleton /> }
);

export default function WishlistPage() {
  return (
    <EventModuleGate moduleKey="wishlist">
      <CanhoesWishlistModule />
    </EventModuleGate>
  );
}
