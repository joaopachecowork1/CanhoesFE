"use client";

import { CanhoesWishlistModule } from "@/components/modules/canhoes/CanhoesWishlistModule";
import { ModuleAccessGuard } from "@/components/modules/canhoes/ModuleAccessGuard";

export default function WishlistPage() {
  return (
    <ModuleAccessGuard moduleKey="wishlist">
      <CanhoesWishlistModule />
    </ModuleAccessGuard>
  );
}
