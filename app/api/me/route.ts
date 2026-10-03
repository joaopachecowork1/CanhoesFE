import { unauthorized } from "@/lib/api/httpError";
import { apiRoute, json } from "@/lib/api/route";
import { getRequestUser } from "@/lib/domains/auth/services/serverAuth";

export const GET = apiRoute(async () => {
  const user = await getRequestUser();
  if (!user) throw unauthorized();
  return json({ user });
});
