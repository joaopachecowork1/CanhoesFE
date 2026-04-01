/**
 * moderationUtils – shared helpers for the admin moderation workflow.
 *
 * These utilities are intentionally kept pure (no React, no API calls) so they
 * can be reused across any component that deals with nominees, category
 * proposals, or measure proposals.
 */

export type ModerationStatus = "pending" | "approved" | "rejected";

/**
 * Maps a moderation status string to a shadcn Badge variant.
 * - approved  → "default"     (green-ish / primary)
 * - rejected  → "destructive" (red)
 * - pending   → "secondary"   (neutral / muted)
 */
export function statusBadgeVariant(
  status: string
): "default" | "destructive" | "secondary" {
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
}

/**
 * Counts how many items in a list fall into each moderation bucket.
 *
 * Works with any object that has a `status` string field (nominees,
 * category proposals, measure proposals all share this shape).
 *
 * @returns `{ pending, approved, rejected }` — always all three keys present.
 */
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
