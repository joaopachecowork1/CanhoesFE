import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Tone = "default" | "destructive" | "neutral" | "primary";

type Props = {
  title: string;
  description?: string;
  count?: number;
  tone?: Tone;
  children?: React.ReactNode;
};

export function AdminSectionStage({
  title,
  description,
  count,
  tone = "default",
  children,
}: Readonly<Props>) {
  const toneStyles = {
    default: "text-[var(--text-ink)]",
    destructive: "text-[var(--text-error)]",
    neutral: "text-[var(--beige)]",
    primary: "text-[var(--text-ink)]",
  };

  return (
    <div className="space-y-1">
      <div className={cn("flex items-center gap-3", toneStyles[tone])}>
        <p className="text-xl font-semibold">{title}</p>
        {count !== undefined ? (
          <Badge variant="outline">{count}</Badge>
        ) : null}
      </div>
      {description ? (
        <p className="body-small text-[var(--bark)]/72">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
