import dynamic from "next/dynamic";
import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";

const CanhoesSecretSantaModule = dynamic(
  () => import("@/components/modules/canhoes/CanhoesSecretSantaModule").then((m) => ({ default: m.CanhoesSecretSantaModule })),
  { loading: () => <FeedSkeleton /> }
);

export default function AmigoSecretoPage() {
  return (
    <EventModuleGate moduleKey="secretSanta">
      <CanhoesSecretSantaModule />
    </EventModuleGate>
  );
}
