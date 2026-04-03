"use client";

import {
  CanhoesEventHomeContent,
  CanhoesEventHomeErrorState,
  CanhoesEventHomeLoadingState,
} from "@/components/modules/canhoes/home/HomeSections";
import { useCanhoesEventHome } from "@/components/modules/canhoes/home/useCanhoesEventHome";

export function CanhoesEventHomeModule() {
  const { errorMessage, isLoading, viewModel } = useCanhoesEventHome();

  if (isLoading) {
    return <CanhoesEventHomeLoadingState />;
  }

  if (!viewModel) {
    return <CanhoesEventHomeErrorState errorMessage={errorMessage} />;
  }

  return <CanhoesEventHomeContent viewModel={viewModel} />;
}
