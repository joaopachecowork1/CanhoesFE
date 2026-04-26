/**
 * Format a UTC date string to locale date time string (pt-PT).
 * Used for metadata like "created at" timestamps.
 */
export function formatDateTimeUtc(date: string): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleString("pt-PT");
}
