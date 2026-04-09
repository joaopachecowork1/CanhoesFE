"use client";

import {
  CanhoesEventHomeContent,
  CanhoesEventHomeErrorState,
  CanhoesEventHomeLoadingState,
} from "@/components/modules/canhoes/home/HomeSections";
import { useCanhoesEventHome } from "@/components/modules/canhoes/home/useCanhoesEventHome";
import { SectionBoundary } from "@/components/ui/section-boundary";

export function CanhoesEventHomeModule() {
  const { errorMessage, isLoading, viewModel } = useCanhoesEventHome();

  if (isLoading) {
    return <CanhoesEventHomeLoadingState />;
  }

  if (!viewModel) {
    return <CanhoesEventHomeErrorState errorMessage={errorMessage} />;
  }

  return (
    <SectionBoundary
      title="Erro ao abrir o evento"
      description="A home do evento falhou ao renderizar. Podes tentar novamente sem sair da edicao."
      onRetry={() => globalThis.location.reload()}
      resetKey={viewModel.event.id}
    >
      <CanhoesEventHomeContent viewModel={viewModel} />
    </SectionBoundary>
  );
}
