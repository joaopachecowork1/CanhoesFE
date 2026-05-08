import dynamic from "next/dynamic";
import { EventModuleGate } from "@/components/modules/canhoes/shared/EventModuleGate";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";

const CanhoesWishlistModule = dynamic(
  () => import("@/components/modules/canhoes/wishlist/CanhoesWishlistModule").then((m) => ({ default: m.CanhoesWishlistModule })),
  { loading: () => <FeedSkeleton /> }
);

export default function WishlistPage() {
  return (
    <EventModuleGate moduleKey="wishlist">
      <CanhoesWishlistModule />
    </EventModuleGate>
  );
}
