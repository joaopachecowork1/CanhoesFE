import { notFound, redirect } from "next/navigation";
import dynamic from "next/dynamic";

import CanhoesAdminModule from "@/components/modules/canhoes/admin/CanhoesAdminModule";
import { isAdminSectionId, type AdminSectionId } from "@/components/modules/canhoes/admin/adminSections";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";

const AdminGate = dynamic(
  () => import("@/components/modules/canhoes/admin/components/AdminGate").then((m) => ({ default: m.AdminGate })),
  { loading: () => <FeedSkeleton /> }
);

const AdminSectionShell = dynamic(
  () => import("@/components/modules/canhoes/admin/components/AdminSectionShell").then((m) => ({ default: m.AdminSectionShell })),
  { loading: () => <FeedSkeleton /> }
);

// Mapeamento de secções antigas para novas (retrocompatibilidade)
const OLD_TO_NEW_SECTION_MAP: Record<string, AdminSectionId> = {
  overview: "dashboard",
  categories: "conteudo",
  nominations: "conteudo",
  results: "conteudo",
  members: "membros",
  modules: "configuracoes",
  phase: "configuracoes",
};

type AdminSectionPageProps = {
  params: Promise<{ section: string }>;
};

export default async function AdminSectionPage({
  params,
}: Readonly<AdminSectionPageProps>) {
  const { section } = await params;

  // Redirecionar secções antigas para as novas
  const newSection = OLD_TO_NEW_SECTION_MAP[section];
  if (newSection && newSection !== section) {
    redirect(`/canhoes/admin/${newSection}`);
  }

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
