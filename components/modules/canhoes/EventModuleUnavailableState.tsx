"use client";

import Link from "next/link";
import { Lock, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EventModuleUnavailableState({
  description,
  fallbackHref,
  fallbackLabel,
  title,
}: Readonly<{
  description: string;
  fallbackHref: string;
  fallbackLabel: string;
  title: string;
}>) {
  return (
    <Card className="canhoes-paper-card border-[rgba(107,76,42,0.16)] text-[var(--text-ink)] shadow-[var(--shadow-paper-soft)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-[var(--text-ink)]">
          <Lock className="h-4 w-4 text-[var(--accent-purple-deep)]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="body-small text-[var(--bark)]/78">{description}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={fallbackHref}>Ir para {fallbackLabel}</Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            Recarregar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
