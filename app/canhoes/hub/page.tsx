import { redirect } from "next/navigation";

/**
 * @deprecated Legacy route — will be removed in next cleanup.
 * Canonical route: /canhoes
 */
export default function CanhoesHubRedirect() {
  redirect("/canhoes");
}
