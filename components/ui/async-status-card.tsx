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
        "rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]",
        className
      )}
    >
      <CardContent className="flex min-h-[14rem] flex-col items-center justify-center gap-3 p-5 text-center">
        <div className="flex items-center gap-3 text-[rgba(245,237,224,0.84)]">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--moss)]" />
          <span className="font-[var(--font-mono)] text-sm uppercase tracking-[0.16em]">
            {label}
          </span>
        </div>

        {hint ? (
          <p className="max-w-md text-sm text-[rgba(245,237,224,0.72)]">{hint}</p>
        ) : null}

        {timedOut ? (
          <div className="space-y-3">
            <p className="max-w-md text-sm text-[rgba(245,237,224,0.78)]">{timeoutHint}</p>
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
