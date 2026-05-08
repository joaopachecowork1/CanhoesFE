import type { NomineeDto } from "@/lib/api/types";

/**
 * Retorna a variante de Badge adequada para o estado de um nominee.
 */
export function getNomineeStatusBadgeVariant(status: NomineeDto["status"]) {
  if (status === "approved") return "secondary" as const;
  if (status === "rejected") return "destructive" as const;
  return "outline" as const;
}
