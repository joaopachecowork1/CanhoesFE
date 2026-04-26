import { CanhoesEventHomeModule } from "@/components/modules/canhoes/CanhoesEventHomeModule";
import { canhoesServerFetch } from "@/lib/api/canhoesServerClient";
import type { EventHomeSnapshotDto } from "@/lib/api/types";

export default async function CanhoesPage() {
  const initialData = await canhoesServerFetch<EventHomeSnapshotDto>("events/active/home-snapshot");
  
  return <CanhoesEventHomeModule initialData={initialData ?? undefined} />;
}
