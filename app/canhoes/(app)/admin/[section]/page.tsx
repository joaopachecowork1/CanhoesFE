import { notFound, redirect } from "next/navigation";
import dynamic from "next/dynamic";

import CanhoesAdminModule from "@/components/modules/canhoes/admin/CanhoesAdminModule";
import { isAdminSectionId } from "@/components/modules/canhoes/admin/adminSections";
import { AdminRouteTabs } from "@/components/modules/canhoes/admin/components/AdminRouteTabs";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";

const AdminGate = dynamic(
  () => import("@/components/modules/canhoes/admin/components/AdminGate").then((m) => ({ default: m.AdminGate })),
  { loading: () => <FeedSkeleton /> }
);

const LEGACY_SECTION_REDIRECTS: Record<string, string> = {
  overview: "/canhoes/admin/dashboard",
  categories: "/canhoes/admin/conteudo?view=categorias",
  nominations: "/canhoes/admin/conteudo",
  results: "/canhoes/admin/conteudo?view=resultados",
  members: "/canhoes/admin/membros",
  modules: "/canhoes/admin/configuracoes",
  phase: "/canhoes/admin/configuracoes",
};

type AdminSectionPageProps = {
  params: Promise<{ section: string }>;
};

export default async function AdminSectionPage({
  params,
}: Readonly<AdminSectionPageProps>) {
  const { section } = await params;

  const legacyRedirectTarget = LEGACY_SECTION_REDIRECTS[section];
  if (legacyRedirectTarget) {
    redirect(legacyRedirectTarget);
  }

  if (!isAdminSectionId(section)) {
    notFound();
  }

  return (
    <AdminGate>
      <div className="zone-admin space-y-2">
        <AdminRouteTabs activeId={section} />
        <CanhoesAdminModule section={section} />
      </div>
    </AdminGate>
  );
}
