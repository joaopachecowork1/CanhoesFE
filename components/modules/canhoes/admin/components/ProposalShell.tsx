import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Card container for proposal review sections.
 * Provides a consistent layout with title, subtitle, description, and content slots.
 * Matches the dark paper theme with moose-inspired border colors.
 *
 * @example
 * ```tsx
 * <ProposalShell
 *   title="Categorias pendentes"
 *   subtitle="Categorias sem revisao de moderacao"
 *   description="Todas as propostas devem ser revistas antes de serem aprovadas."
 * >
 *   <ProposalList items={items} />
 * </ProposalShell>
 * ```
 */
export function ProposalShell({
  children,
  description,
  subtitle,
  title,
}: Readonly<{
  children: React.ReactNode;
  description: string;
  subtitle: string;
  title: string;
}>) {
  return (
    <Card className="border-[var(--color-moss)]/20 bg-[rgba(16,20,11,0.9)]">
      <CardHeader className="space-y-2">
        <p className="editorial-kicker">{subtitle}</p>
        <CardTitle>{title}</CardTitle>
        <p className="body-small text-[var(--color-text-muted)]">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}
