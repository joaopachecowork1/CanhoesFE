"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AsyncStatusCardProps = {
  actionLabel?: string;
  className?: string;
  hint?: string;
  label: string;
  onAction?: () => void;
  timeoutHint?: string;
  timeoutMs?: number;
};

export function AsyncStatusCard({
  actionLabel = "Tentar novamente",
  className,
  hint,
  label,
  onAction,
  timeoutHint = "Se isto demorar mais do que o normal, tenta atualizar esta area.",
  timeoutMs = 8000,
}: Readonly<AsyncStatusCardProps>) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setTimedOut(false);
    const timer = globalThis.setTimeout(() => setTimedOut(true), timeoutMs);
    return () => globalThis.clearTimeout(timer);
  }, [label, timeoutMs]);

  return (
    <Card
      className={cn(
        "rounded-[var(--radius-lg-token)] border border-[var(--border-paper)] bg-[var(--bg-paper)] text-[var(--ink-primary)] shadow-[var(--shadow-paper)]",
        className
      )}
    >
      <CardContent className="flex min-h-[14rem] flex-col items-center justify-center gap-3 p-5 text-center">
        <div className="flex items-center gap-3 text-[var(--ink-secondary)]">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--moss)]" />
          <span className="font-[var(--font-mono)] text-sm uppercase tracking-[0.16em]">
            {label}
          </span>
        </div>

        {hint ? (
          <p className="max-w-md text-sm text-[var(--ink-secondary)]">{hint}</p>
        ) : null}

        {timedOut ? (
          <div className="space-y-3">
            <p className="max-w-md text-sm text-[var(--ink-secondary)]">{timeoutHint}</p>
            {onAction ? (
              <div className="flex justify-center">
                <Button type="button" size="sm" variant="outline" onClick={onAction}>
                  {actionLabel}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
