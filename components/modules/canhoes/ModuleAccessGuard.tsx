"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AlertTriangle, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEventOverview } from "@/hooks/useEventOverview";
import { useEventAccess } from "@/hooks/useEventAccess";
import type { CanhoesMemberModuleKey } from "@/lib/modules";
import { CANHOES_MEMBER_MODULE_MAP } from "@/lib/modules";

type ModuleAccessGuardProps = {
  /**
   * The module key to check access for.
   */
  moduleKey: CanhoesMemberModuleKey;

  /**
   * The content to render if the user has access to the module.
   */
  children: React.ReactNode;

  /**
   * Optional custom blocked message.
   */
  blockedMessage?: string;

  /**
   * If true, redirects to home instead of showing blocked UI.
   * Default: false
   */
  redirectOnBlock?: boolean;
};

/**
 * Module Access Guard Component
 *
 * Wraps module content and enforces access control based on backend-computed
 * module visibility from EventOverviewDto.
 *
 * Usage:
 * ```tsx
 * <ModuleAccessGuard moduleKey="voting">
 *   <CanhoesVotingModule />
 * </ModuleAccessGuard>
 * ```
 *
 * This component:
 * - Checks if the module is accessible via useEventAccess hook
 * - Shows loading state while data loads
 * - Shows blocked/locked UI if module is not accessible
 * - Optionally redirects to home if module is blocked
 * - Renders children if module is accessible
 */
export function ModuleAccessGuard({
  moduleKey,
  children,
  blockedMessage,
  redirectOnBlock = false,
}: Readonly<ModuleAccessGuardProps>) {
  const router = useRouter();
  const { overview, isLoading } = useEventOverview();
  const { checkModuleAccess } = useEventAccess(overview);

  const accessState = checkModuleAccess(moduleKey);
  const moduleInfo = CANHOES_MEMBER_MODULE_MAP[moduleKey];

  // Redirect to home if blocked and redirect is enabled
  useEffect(() => {
    if (!isLoading && !accessState.isAccessible && redirectOnBlock) {
      router.push("/canhoes");
    }
  }, [isLoading, accessState.isAccessible, redirectOnBlock, router]);

  // Show loading state while overview data loads
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="text-muted-foreground">A carregar...</div>
        </div>
      </div>
    );
  }

  // Show blocked UI if module is not accessible
  if (!accessState.isAccessible) {
    const message =
      blockedMessage ||
      accessState.blockReason ||
      "Este modulo nao esta disponivel no momento.";

    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="border-muted">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-muted">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">{moduleInfo.label} Bloqueado</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => router.push("/canhoes")}
                className="w-full"
              >
                Voltar ao Evento
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Module is accessible - render children
  return <>{children}</>;
}
