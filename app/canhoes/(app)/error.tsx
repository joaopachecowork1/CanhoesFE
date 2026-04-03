"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { getErrorMessage, logFrontendError } from "@/lib/errors";

export default function CanhoesError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    logFrontendError("CanhoesErrorBoundary", error);
  }, [error]);

  return (
    <div className="p-6 md:p-8 rounded-2xl canhoes-glass canhoes-neon-border space-y-4">
      <div className="text-2xl font-semibold canhoes-title">Canhoes do Ano</div>
      <ErrorAlert
        title="Erro ao carregar esta secao"
        description={getErrorMessage(
          error,
          "Houve um erro ao carregar esta secao. Podes tentar novamente ou recarregar a pagina."
        )}
      />
      <div className="flex gap-2 flex-wrap">
        <Button className="canhoes-tap canhoes-neon-border" onClick={() => reset()}>
          Tentar novamente
        </Button>
        <Button className="canhoes-tap" variant="outline" onClick={() => location.reload()}>
          Recarregar
        </Button>
      </div>
    </div>
  );
}
