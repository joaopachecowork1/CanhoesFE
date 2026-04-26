import { CanhoesNominationsModule } from "@/components/modules/canhoes/CanhoesNominationsModule";
import { canhoesServerFetch } from "@/lib/api/canhoesServerClient";
import type { EventCategoryDto } from "@/lib/api/types";

export default async function NominationsPage() {
  const initialCategories = await canhoesServerFetch<EventCategoryDto[]>("events/active/categories");

  return <CanhoesNominationsModule initialCategories={initialCategories ?? undefined} />;
}
