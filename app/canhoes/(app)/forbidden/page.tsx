import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-lg items-center px-4">
      <Card className="w-full text-center">
        <CardHeader>
          <ShieldX className="mx-auto h-10 w-10 text-[var(--moss)]" />
          <CardTitle>Acesso reservado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">A tua conta não tem permissões para abrir esta área.</p>
          <Button asChild><Link href="/canhoes">Voltar aos Canhões</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
