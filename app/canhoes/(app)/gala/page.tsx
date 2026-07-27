import { redirect } from "next/navigation";

import { EventModuleGate } from "@/components/modules/canhoes/shared/EventModuleGate";
import { CanhoesGalaModule } from "@/components/modules/canhoes/gala/CanhoesGalaModule";
import { canhoesServerFetch } from "@/lib/api/canhoesServerClient";
import { IS_LOCAL_MODE } from "@/lib/mock";
import type { EventActiveContextDto, PublicCategoryResultDto } from "@/lib/api/types";

export default async function GalaPage() {
  if (IS_LOCAL_MODE) {
    redirect("/canhoes");
  }

  const activeContext = await canhoesServerFetch<EventActiveContextDto>("events/active/context");
  const initialResults = activeContext
    ? await canhoesServerFetch<PublicCategoryResultDto[]>(`events/${activeContext.event.id}/results`)
    : null;

  return (
    <EventModuleGate moduleKey="gala">
      <CanhoesGalaModule
        initialContext={activeContext ?? undefined}
        initialResults={initialResults ?? undefined}
      />
    </EventModuleGate>
  );
}
