"use client";

import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { CanhoesWishlistModule } from "@/components/modules/canhoes/CanhoesWishlistModule";

export default function WishlistPage() {
  return (
    <EventModuleGate moduleKey="wishlist">
      <CanhoesWishlistModule />
    </EventModuleGate>
  );
}
