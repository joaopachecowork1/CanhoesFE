"use client";

import type { ReactNode } from "react";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";

import { EventModuleGate } from "@/components/modules/canhoes/EventModuleGate";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEventOverview } from "@/hooks/useEventOverview";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";

function AdminStateCard({
  action,
  description,
  title,
}: Readonly<{
  action?: ReactNode;
  description: string;
  title: string;
}>) {
  return (
    <section className="page-hero mx-auto max-w-xl px-5 py-10 text-center sm:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(0,255,136,0.18)] bg-[rgba(38,54,26,0.72)] text-[var(--neon-green)] shadow-[var(--glow-green-sm)]">
        <Shield className="h-7 w-7" />
      </div>
      <div className="mt-5 space-y-2">
        <h2 className="heading-2 text-[var(--bg-paper)]">{title}</h2>
        <p className="body-small text-[rgba(245,237,224,0.74)]">{description}</p>
      </div>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}

export function AdminGate({ children }: Readonly<{ children: ReactNode }>) {
  const {
    loading,
    profileError,
    profileLoading,
    isLogged,
    refreshProfile,
    user,
    loginGoogle,
    logout,
  } = useAuth();
  const eventOverview = useEventOverview();
  const isAdmin = useIsAdmin();
  const hasAdminAccess = isAdmin || Boolean(eventOverview.overview?.permissions.isAdmin);
  const router = useRouter();

  if (loading) {
    return (
      <AdminStateCard
        title="A verificar permissoes"
        description="A secao de administracao so abre depois de validar a sessao e as regras do evento."
        action={
          <div className="mx-auto h-9 w-9 rounded-full border-4 border-[var(--color-moss)] border-t-transparent animate-spin" />
        }
      />
    );
  }

  if (isLogged && !user) {
    return (
      <AdminStateCard
        title="A sincronizar perfil"
        description="A conta ja tem sessao, mas o perfil ainda esta a ser sincronizado com o contexto do evento."
        action={
          <div className="mx-auto h-9 w-9 rounded-full border-4 border-[var(--color-moss)] border-t-transparent animate-spin" />
        }
      />
    );
  }

  if (profileLoading) {
    return (
      <AdminStateCard
        title="A sincronizar perfil"
        description="A conta ja tem sessao, mas o perfil ainda esta a ser sincronizado com o contexto do evento."
        action={
          <div className="mx-auto h-9 w-9 rounded-full border-4 border-[var(--color-moss)] border-t-transparent animate-spin" />
        }
      />
    );
  }

  if (isLogged && profileError && !hasAdminAccess) {
    return (
      <AdminStateCard
        title="Perfil nao validado"
        description={`A sessao autenticou, mas o backend nao conseguiu validar o teu perfil agora: ${profileError.message}`}
        action={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                void refreshProfile();
                void eventOverview.refresh();
              }}
            >
              Tentar novamente
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => logout()}
            >
              Terminar sessao
            </Button>
          </div>
        }
      />
    );
  }

  if (isLogged && !isAdmin && eventOverview.isLoading) {
    return (
      <AdminStateCard
        title="A validar permissões"
        description="A confirmar as permissões administrativas deste evento antes de abrir o centro de controlo."
        action={
          <div className="mx-auto h-9 w-9 rounded-full border-4 border-[var(--color-moss)] border-t-transparent animate-spin" />
        }
      />
    );
  }

  if (!isLogged) {
    return (
      <AdminStateCard
        title="Sessao necessaria"
        description="Entra com a tua conta para abrir o centro de controlo do evento."
        action={
          <Button className="w-full sm:w-auto" onClick={loginGoogle}>
            Entrar com Google
          </Button>
        }
      />
    );
  }

  if (!hasAdminAccess) {
    return (
      <AdminStateCard
        title="Acesso restrito"
        description="Esta area continua visivel, mas so os admins confirmados conseguem moderar propostas, votos e fases do evento."
        action={
          <Button variant="outline" onClick={() => router.push("/canhoes")}>
            Voltar ao feed
          </Button>
        }
      />
    );
  }

  return <EventModuleGate moduleKey="admin">{children}</EventModuleGate>;
}
