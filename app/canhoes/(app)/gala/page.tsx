import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import { IS_LOCAL_MODE } from "@/lib/mock";

const CanhoesGalaModule = dynamic(
  () => import("@/components/modules/canhoes/CanhoesGalaModule").then((m) => ({ default: m.CanhoesGalaModule })),
  { loading: () => <FeedSkeleton /> }
);

export default function GalaPage() {
  if (IS_LOCAL_MODE) {
    redirect("/canhoes");
  }

  return (
    <EventModuleGate moduleKey="gala">
      <CanhoesGalaModule />
    </EventModuleGate>
  );
}
