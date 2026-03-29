export type ModerationStatus = "pending" | "approved" | "rejected";

export function statusBadgeVariant(
  status: string
): "default" | "destructive" | "secondary" {
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
}

export function summarizeModerationStatuses<T extends { status: string }>(items: T[]) {
  return items.reduce<Record<ModerationStatus, number>>(
    (summary, item) => {
      if (item.status === "pending") summary.pending += 1;
      if (item.status === "approved") summary.approved += 1;
      if (item.status === "rejected") summary.rejected += 1;
      return summary;
    },
    { approved: 0, pending: 0, rejected: 0 }
  );
}
