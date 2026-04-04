import { redirect } from "next/navigation";

import { getDefaultAdminSection } from "@/components/modules/canhoes/admin/adminSections";

export default function AdminPage() {
  redirect(`/canhoes/admin/${getDefaultAdminSection()}`);
}
