import dynamic from "next/dynamic";
import { EventModuleGate } from "@/components/modules/canhoes/shared/EventModuleGate";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";

const CanhoesCategoriesModule = dynamic(
  () => import("@/components/modules/canhoes/categorias/CanhoesCategoriesModule").then((m) => ({ default: m.CanhoesCategoriesModule })),
  { loading: () => <FeedSkeleton /> }
);

export default function CategoriasPage() {
  return (
    <EventModuleGate moduleKey="categories">
      <CanhoesCategoriesModule />
    </EventModuleGate>
  );
}
