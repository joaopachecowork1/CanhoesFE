"use client";

import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { CanhoesWishlistModule } from "@/components/modules/canhoes/CanhoesWishlistModule";
import { ModuleAccessGuard } from "@/components/modules/canhoes/ModuleAccessGuard";

export default function WishlistPage() {
  return (
    <EventModuleGate moduleKey="wishlist">
      <CanhoesWishlistModule />
    </EventModuleGate>
  );
}
