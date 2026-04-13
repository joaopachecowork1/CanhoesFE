"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PostErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface PostErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class PostErrorBoundary extends Component<
  PostErrorBoundaryProps,
  PostErrorBoundaryState
> {
  constructor(props: PostErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): PostErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error tracking service if available
    console.error("PostErrorBoundary caught an error:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.reset);
      }

      return (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-deep)] px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--neon-amber)]" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Este post nao pode ser exibido
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Ocorreu um erro ao renderizar este conteudo
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={this.reset}
            className="shrink-0"
            aria-label="Tentar renderizar o post novamente"
          >
            Tentar novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
