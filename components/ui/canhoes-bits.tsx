import { cn } from "@/lib/utils";

type CanhoesGlowTone = "admin" | "danger" | "official" | "shell" | "social";
type CanhoesDividerTone = "amber" | "moss" | "purple";

export function CanhoesGlowBackdrop({
  className,
  tone = "shell",
}: Readonly<{
  className?: string;
  tone?: CanhoesGlowTone;
}>) {
  return (
    <div
      aria-hidden="true"
      className={cn("canhoes-bits-backdrop", `canhoes-bits-backdrop--${tone}`, className)}
    >
      <span className="canhoes-bits-backdrop__orb canhoes-bits-backdrop__orb--one" />
      <span className="canhoes-bits-backdrop__orb canhoes-bits-backdrop__orb--two" />
      <span className="canhoes-bits-backdrop__orb canhoes-bits-backdrop__orb--three" />
      <span className="canhoes-bits-backdrop__grid" />
    </div>
  );
}

export function CanhoesDecorativeDivider({
  className,
  tone = "moss",
}: Readonly<{
  className?: string;
  tone?: CanhoesDividerTone;
}>) {
  return (
    <div
      aria-hidden="true"
      className={cn("canhoes-bits-divider", `canhoes-bits-divider--${tone}`, className)}
    />
  );
}
