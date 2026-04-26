import { CanhoesOfficialVotingModule } from "@/components/modules/canhoes/CanhoesOfficialVotingModule";
import { canhoesServerFetch } from "@/lib/api/canhoesServerClient";
import type { OfficialVotingBoardDto } from "@/lib/api/types";

export default async function VotingPage() {
  // We need to know the active event ID first, but our server fetch can handle 
  // the 'active' alias if the backend supports it, or we fetch the summary first.
  // Assuming the backend supports /events/active/voting-board
  const initialData = await canhoesServerFetch<OfficialVotingBoardDto>("events/active/voting-board");

  return <CanhoesOfficialVotingModule initialData={initialData ?? undefined} />;
}
