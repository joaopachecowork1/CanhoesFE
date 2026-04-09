"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { cn } from "@/lib/utils";

type SectionBoundaryProps = {
  children: ReactNode;
  className?: string;
  description: string;
  fallbackClassName?: string;
  resetKey?: string | number | null;
  retryLabel?: string;
  title: string;
  onRetry?: () => void;
};

type SectionBoundaryState = {
  error: Error | null;
};

class SectionBoundaryInner extends Component<
  SectionBoundaryProps,
  SectionBoundaryState
> {
  override state: SectionBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): SectionBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logFrontendError("SectionBoundary", error, {
      componentStack: errorInfo.componentStack,
      sectionTitle: this.props.title,
    });
  }

  override componentDidUpdate(prevProps: Readonly<SectionBoundaryProps>) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  handleRetry = () => {
    this.setState({ error: null });
    this.props.onRetry?.();
  };

  override render() {
    const { children, className, description, fallbackClassName, retryLabel, title } =
      this.props;
    const { error } = this.state;

    if (!error) {
      return <>{children}</>;
    }

    return (
      <Card className={cn(className, fallbackClassName)}>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <ErrorAlert
            title={title}
            description={getErrorMessage(error, description)}
          />

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={this.handleRetry}
            className="border-[rgba(255,236,231,0.18)] bg-[rgba(30,18,12,0.92)] text-[rgba(255,236,231,0.92)] hover:bg-[rgba(44,24,16,0.96)]"
          >
            {retryLabel ?? "Tentar novamente"}
          </Button>
        </CardContent>
      </Card>
    );
  }
}

export function SectionBoundary(props: Readonly<SectionBoundaryProps>) {
  return <SectionBoundaryInner {...props} />;
}
