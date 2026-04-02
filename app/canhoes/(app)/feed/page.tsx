import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { HubFeedModule } from "@/components/modules/hub/HubFeedModule";

export default function CanhoesFeedPage() {
  return (
    <EventModuleGate moduleKey="feed">
      <HubFeedModule showComposer={false} />
    </EventModuleGate>
  );
}
