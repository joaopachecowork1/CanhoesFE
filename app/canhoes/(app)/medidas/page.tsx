import dynamic from "next/dynamic";
import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import { canhoesServerFetch } from "@/lib/api/canhoesServerClient";
import type { GalaMeasureDto } from "@/lib/api/types";

const CanhoesMeasuresModule = dynamic(
  () => import("@/components/modules/canhoes/CanhoesMeasuresModule").then((m) => ({ default: m.CanhoesMeasuresModule })),
  { loading: () => <FeedSkeleton /> }
);

export default async function MeasuresPage() {
  const initialData = await canhoesServerFetch<GalaMeasureDto[]>("events/active/measures");

  return (
    <EventModuleGate moduleKey="measures">
      <CanhoesMeasuresModule initialData={initialData ?? undefined} />
    </EventModuleGate>
  );
}
