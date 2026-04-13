import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <p className="body-small max-w-[64ch] text-[var(--color-text-muted)]">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}
