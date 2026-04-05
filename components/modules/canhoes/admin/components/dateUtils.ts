/**
 * Format a date string or timestamp to locale date string (pt-PT).
 * Falls back to the original string if parsing fails.
 */
export function formatDate(date: string): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("pt-PT");
}

/**
 * Format a UTC date string to locale date time string (pt-PT).
 * Used for metadata like "created at" timestamps.
 */
export function formatDateTimeUtc(date: string): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleString("pt-PT");
}
