"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import {
  useEventModuleAccess,
  type EventRouteModuleKey,
} from "@/hooks/useEventModuleAccess";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Card, CardContent } from "@/components/ui/card";

import { EventModuleUnavailableState } from "./EventModuleUnavailableState";

export function EventModuleGate({
  children,
  moduleKey,
}: Readonly<{
  children: ReactNode;
  moduleKey: EventRouteModuleKey;
}>) {
  const access = useEventModuleAccess(moduleKey);

  if (access.isLoading) {
    return (
      <Card className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]">
        <CardContent className="flex min-h-[14rem] items-center justify-center">
          <div className="flex items-center gap-3 text-[rgba(245,237,224,0.76)]">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--moss)]" />
            <span className="font-[var(--font-mono)] text-sm uppercase tracking-[0.16em]">
              A validar acesso
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (access.error || !access.event || !access.overview) {
    return (
      <Card className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <ErrorAlert
            title={`Erro ao abrir ${access.module.label}`}
            description={
              access.error?.message ??
              "Nao foi possivel confirmar o estado do evento agora."
            }
            actionLabel="Tentar novamente"
            onAction={() => void access.refresh()}
          />
        </CardContent>
      </Card>
    );
  }

  if (!access.isAllowed) {
    return (
      <EventModuleUnavailableState
        title={`${access.module.label} indisponivel`}
        description="Esta area nao esta aberta para ti na configuracao atual do evento ou na fase ativa."
        fallbackHref={access.fallbackHref}
        fallbackLabel={access.fallbackLabel}
      />
    );
  }

  return <>{children}</>;
}
