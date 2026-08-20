import { redirect } from "next/navigation";

import { getDefaultAdminSection } from "@/lib/domains/admin/components/adminSections";

export default function AdminPage() {
  redirect(`/canhoes/admin/${getDefaultAdminSection()}`);
}
