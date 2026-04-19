import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CanhoesDecorativeDivider, CanhoesGlowBackdrop } from "@/components/ui/canhoes-bits";
import { Button } from "@/components/ui/button";

type ErrorAlertProps = {
  actionLabel?: string;
  className?: string;
  description: string;
  onAction?: () => void;
  tone?: "danger" | "official" | "social";
  title?: string;
};

export function ErrorAlert({
  actionLabel,
  className,
  description,
  onAction,
  tone = "danger",
  title = "Algo correu mal",
}: Readonly<ErrorAlertProps>) {
  return (
    <Alert
      className={cn(
        "surface-panel relative overflow-hidden border text-[rgba(255,236,231,0.94)]",
        tone === "danger" && "border-[rgba(224,90,58,0.24)]",
        tone === "official" &&
          "border-[rgba(0,255,136,0.18)] text-[rgba(245,237,224,0.94)]",
        tone === "social" &&
          "border-[rgba(177,140,255,0.22)] text-[rgba(245,237,224,0.94)]",
        className
      )}
    >
      <CanhoesGlowBackdrop tone={tone === "danger" ? "danger" : tone} />
      <AlertCircle
        className={cn(
          tone === "danger" ? "text-[rgba(255,236,231,0.94)]" : "text-[var(--neon-green)]"
        )}
      />
      <AlertTitle
        className={cn(
          tone === "danger" ? "text-[rgba(255,236,231,0.98)]" : "text-[var(--bg-paper)]"
        )}
      >
        {title}
      </AlertTitle>
      <AlertDescription
        className={cn(
          "space-y-3",
          tone === "danger" ? "text-[rgba(255,236,231,0.82)]" : "text-[rgba(245,237,224,0.76)]"
        )}
      >
        <p>{description}</p>
        {actionLabel && onAction ? (
          <>
            <CanhoesDecorativeDivider
              tone={tone === "social" ? "purple" : tone === "official" ? "moss" : "amber"}
              className="max-w-44"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onAction}
              className={cn(
                "border bg-transparent backdrop-blur-sm",
                tone === "danger" &&
                  "border-[rgba(255,236,231,0.18)] text-[rgba(255,236,231,0.92)] hover:bg-[rgba(44,24,16,0.96)]",
                tone !== "danger" &&
                  "border-[rgba(245,237,224,0.12)] text-[var(--bg-paper)] hover:bg-[rgba(245,237,224,0.08)]"
              )}
            >
              {actionLabel}
            </Button>
          </>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
