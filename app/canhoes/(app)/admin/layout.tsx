import { redirect } from "next/navigation";
import { getRequestUser } from "@/lib/auth/serverAuth";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getRequestUser();
  if (!user) redirect("/canhoes/login");
  if (!user.isAdmin) redirect("/canhoes/forbidden");
  return children;
}
