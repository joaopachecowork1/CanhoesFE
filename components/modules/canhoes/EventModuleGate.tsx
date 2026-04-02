"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import {
  useEventModuleAccess,
  type EventRouteModuleKey,
} from "@/hooks/useEventModuleAccess";
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
      <Card className="canhoes-paper-card border-[rgba(107,76,42,0.16)] text-[var(--text-ink)] shadow-[var(--shadow-paper-soft)]">
        <CardContent className="flex min-h-[14rem] items-center justify-center">
          <div className="flex items-center gap-3 text-[var(--bark)]/76">
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
      <EventModuleUnavailableState
        title={`Sem acesso a ${access.module.label}`}
        description="Nao foi possivel confirmar o estado do evento agora. Recarrega a pagina ou volta ao inicio do evento."
        fallbackHref={access.fallbackHref}
        fallbackLabel={access.fallbackLabel}
      />
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
