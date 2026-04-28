import { CanhoesNominationsModule } from "@/components/modules/canhoes/CanhoesNominationsModule";
import { canhoesServerFetch } from "@/lib/api/canhoesServerClient";
import type { EventActiveContextDto, EventCategoryDto, PagedResultDto } from "@/lib/api/types";

export default async function NominationsPage() {
  const activeContext = await canhoesServerFetch<EventActiveContextDto>("events/active/context");
  const categoriesPage = activeContext
    ? await canhoesServerFetch<PagedResultDto<EventCategoryDto>>(
        `events/${activeContext.event.id}/categories?skip=0&take=50`
      )
    : null;
  const initialCategories = categoriesPage?.items ?? undefined;

  return <CanhoesNominationsModule initialCategories={initialCategories} />;
}
