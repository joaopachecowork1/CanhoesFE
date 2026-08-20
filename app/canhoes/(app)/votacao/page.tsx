import { CanhoesOfficialVotingModule } from "@/lib/domains/voting/components/CanhoesOfficialVotingModule";
import { canhoesServerFetch } from "@/lib/api/canhoesServerClient";
import type { EventActiveContextDto, EventVotingBoardDto, OfficialVotingBoardDto } from "@/lib/api/types";

function mapEventVotingBoardToOfficialVotingBoard(
  board: EventVotingBoardDto
): OfficialVotingBoardDto {
  return {
    eventId: board.eventId,
    phaseId: board.phaseId,
    canVote: board.canVote,
    categories: board.categories.map((category) => ({
      id: category.id,
      eventId: board.eventId,
      title: category.title,
      description: category.description,
      kind: category.kind,
      voteQuestion: category.voteQuestion,
      nominees: category.options.map((option) => ({
        id: option.id,
        categoryId: category.id,
        label: option.label,
      })),
      myNomineeId: category.myOptionId,
    })),
  };
}

export default async function VotingPage() {
  const activeContext = await canhoesServerFetch<EventActiveContextDto>("events/active/context");
  const initialBoard = activeContext
    ? await canhoesServerFetch<EventVotingBoardDto>(`events/${activeContext.event.id}/voting`)
    : null;
  const initialData = initialBoard
    ? mapEventVotingBoardToOfficialVotingBoard(initialBoard)
    : undefined;

  return <CanhoesOfficialVotingModule initialData={initialData} initialContext={activeContext ?? undefined} />;
}
