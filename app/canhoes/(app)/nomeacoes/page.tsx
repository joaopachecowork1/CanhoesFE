import { CanhoesNominationsModule } from "@/components/modules/canhoes/nomeacoes/CanhoesNominationsModule";
import { canhoesServerFetch } from "@/lib/api/canhoesServerClient";
import type { EventActiveContextDto, AwardCategoryDto, PagedResult } from "@/lib/api/types";

export default async function NominationsPage() {
  const activeContext = await canhoesServerFetch<EventActiveContextDto>("events/active/context");
  const categoriesPage = activeContext
    ? await canhoesServerFetch<PagedResult<AwardCategoryDto>>(
        `events/${activeContext.event.id}/categories?skip=0&take=50`
      )
    : null;
  const initialCategories = categoriesPage?.items ?? undefined;

  return <CanhoesNominationsModule initialCategories={initialCategories} />;
}
