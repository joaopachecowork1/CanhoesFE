import { cn } from "@/lib/utils";

type CanhoesGlowTone = "admin" | "danger" | "official" | "shell" | "social";
type CanhoesDividerTone = "amber" | "moss" | "purple";

/**
 * Backdrop decorativo com efeito de brilho (glow) e padrão de grelha.
 * Utilizado para dar profundidade e destaque visual a painéis e alertas.
 * 
 * @param className - Classes CSS adicionais para o contentor.
 * @param tone - O tom visual do brilho, alinhado com o contexto da aplicação (ex: admin, social).
 */
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

/**
 * Divisor decorativo estilizado para a identidade visual do Canhões.
 * 
 * @param className - Classes CSS adicionais.
 * @param tone - O tom de cor do divisor (amber, moss, purple).
 */
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
