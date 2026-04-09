import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ErrorAlertProps = {
  actionLabel?: string;
  className?: string;
  description: string;
  onAction?: () => void;
  title?: string;
};

export function ErrorAlert({
  actionLabel,
  className,
  description,
  onAction,
  title = "Algo correu mal",
}: Readonly<ErrorAlertProps>) {
  return (
    <Alert
      variant="destructive"
      className={cn(
        "border-[rgba(224,90,58,0.24)] bg-[rgba(30,18,12,0.92)] text-[rgba(255,236,231,0.94)]",
        className
      )}
    >
      <AlertCircle className="text-[rgba(255,236,231,0.94)]" />
      <AlertTitle className="text-[rgba(255,236,231,0.98)]">{title}</AlertTitle>
      <AlertDescription className="text-[rgba(255,236,231,0.82)]">
        <p>{description}</p>
        {actionLabel && onAction ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAction}
            className="mt-3 border-[rgba(255,236,231,0.18)] bg-[rgba(30,18,12,0.92)] text-[rgba(255,236,231,0.92)] hover:bg-[rgba(44,24,16,0.96)]"
          >
            {actionLabel}
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
