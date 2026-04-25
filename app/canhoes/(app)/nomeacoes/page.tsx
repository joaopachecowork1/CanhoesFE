import dynamic from "next/dynamic";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";

const CanhoesNominationsModule = dynamic(
  () => import("@/components/modules/canhoes/CanhoesNominationsModule").then((m) => ({ default: m.CanhoesNominationsModule })),
  { loading: () => <FeedSkeleton /> }
);

export default function NomeacoesPage() {
  return (
    <EventModuleGate moduleKey="nominees">
      <CanhoesNominationsModule />
    </EventModuleGate>
  );
}
