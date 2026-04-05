import type { ReactNode } from "react";
import { Loader2, AlertCircle, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";

type ResourceStateProps = {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  children: ReactNode;
  loadingLabel?: string;
  emptyLabel?: string;
  errorLabel?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

/**
 * Unified loading/error/empty state component.
 * Replaces repetitive conditional rendering patterns across modules.
 *
 * Usage:
 * ```tsx
 * <ResourceState
 *   isLoading={loading}
 *   error={errorMessage}
 *   isEmpty={items.length === 0}
 *   onRetry={() => void refetch()}
 * >
 *   <YourContent />
 * </ResourceState>
 * ```
 */
export function ResourceState({
  isLoading,
  error,
  isEmpty,
  children,
  loadingLabel = "A carregar...",
  emptyLabel = "Sem dados.",
  errorLabel = "Erro ao carregar dados.",
  retryLabel = "Tentar novamente",
  onRetry,
}: ResourceStateProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(11,14,8,0.76)] px-4 py-6 text-sm text-[rgba(245,237,224,0.8)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        {loadingLabel}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-md-token)] border border-[rgba(224,90,58,0.2)] bg-[rgba(224,90,58,0.08)] px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-[rgba(255,236,231,0.9)]">
          <AlertCircle className="h-4 w-4" />
          {errorLabel}
        </div>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(11,14,8,0.76)] px-4 py-6 text-sm text-[rgba(245,237,224,0.7)]">
        <Inbox className="h-4 w-4" />
        {emptyLabel}
      </div>
    );
  }

  return <>{children}</>;
}
