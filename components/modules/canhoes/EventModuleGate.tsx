"use client";

import type { ReactNode } from "react";

import {
  useEventModuleAccess,
  type EventRouteModuleKey,
} from "@/hooks/useEventModuleAccess";
import { AsyncStatusCard } from "@/components/ui/async-status-card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { SectionBoundary } from "@/components/ui/section-boundary";
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

  // OPTIMIZATION: Only show loading on initial fetch when no cached data exists
  // When data is cached (isFetching but not isLoading), render children immediately
  if (access.isLoading) {
    return (
      <AsyncStatusCard
        label="A validar acesso"
        hint={`A confirmar se ${access.module.label.toLowerCase()} esta disponivel neste evento.`}
        timeoutHint="A validacao de acesso esta a demorar mais do que o normal. Podes tentar novamente sem sair desta pagina."
        onAction={() => void access.refresh()}
      />
    );
  }

  if (access.error || !access.event || !access.overview) {
    return (
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <ErrorAlert
            title={`Erro ao abrir ${access.module.label}`}
            description={
              access.error?.message ??
              "Nao foi possivel confirmar o estado do evento agora. Tenta novamente para recuperar esta area."
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

  return (
    <SectionBoundary
      title={`Erro nesta area: ${access.module.label}`}
      description={`Esta area falhou ao renderizar, mas o resto da experiencia continua disponivel. Tenta abrir ${access.module.label.toLowerCase()} novamente.`}
      onRetry={() => void access.refresh()}
      resetKey={moduleKey}
    >
      {children}
    </SectionBoundary>
  );
}
