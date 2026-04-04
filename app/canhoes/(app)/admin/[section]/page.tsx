import { notFound } from "next/navigation";

import CanhoesAdminModule from "@/components/modules/canhoes/admin/CanhoesAdminModule";
import { isAdminSectionId } from "@/components/modules/canhoes/admin/adminSections";
import { AdminGate } from "@/components/modules/canhoes/admin/components/AdminGate";
import { AdminSectionShell } from "@/components/modules/canhoes/admin/components/AdminSectionShell";

type AdminSectionPageProps = {
  params: Promise<{ section: string }>;
};

export default async function AdminSectionPage({
  params,
}: Readonly<AdminSectionPageProps>) {
  const { section } = await params;

  if (!isAdminSectionId(section)) {
    notFound();
  }

  return (
    <AdminGate>
      <AdminSectionShell activeId={section}>
        <CanhoesAdminModule forcedSection={section} showTabs={false} />
      </AdminSectionShell>
    </AdminGate>
  );
}
