"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";

const CanhoesCategoriesModule = dynamic(
  () => import("@/components/modules/canhoes/CanhoesCategoriesModule").then((m) => ({ default: m.CanhoesCategoriesModule })),
  { loading: () => <FeedSkeleton /> }
);

export default function CategoriasPage() {
  useEffect(() => {
    document.title = "Categorias";
  }, []);

  return (
    <EventModuleGate moduleKey="categories">
      <CanhoesCategoriesModule />
    </EventModuleGate>
  );
}
