import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

import CanhoesAdminModule from "@/components/modules/canhoes/admin/CanhoesAdminModule";
import { isAdminSectionId } from "@/components/modules/canhoes/admin/adminSections";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";

const AdminGate = dynamic(
  () => import("@/components/modules/canhoes/admin/components/AdminGate").then((m) => ({ default: m.AdminGate })),
  { loading: () => <FeedSkeleton /> }
);

const AdminSectionShell = dynamic(
  () => import("@/components/modules/canhoes/admin/components/AdminSectionShell").then((m) => ({ default: m.AdminSectionShell })),
  { loading: () => <FeedSkeleton /> }
);

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
