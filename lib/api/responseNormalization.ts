import type {
  EventWishlistItemDto,
} from "@/lib/api/types";

function readArray<T>(value: unknown, keys: readonly string[]): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object") return [];

  const record = value as Record<string, unknown>;

  for (const key of keys) {
    const candidate = record[key];
    if (Array.isArray(candidate)) return candidate as T[];
  }

  return [];
}

export function normalizeArrayResponse<T>(value: unknown): T[] {
  const direct = readArray<T>(value, ["items", "data", "results", "list"]);
  if (direct.length > 0) return direct;
  return Array.isArray(value) ? (value as T[]) : [];
}

export function normalizeWishlistItems(value: unknown): EventWishlistItemDto[] {
  const direct = readArray<EventWishlistItemDto>(value, [
    "items",
    "wishlistItems",
    "data",
    "results",
  ]);
  if (direct.length > 0) return direct;
  return Array.isArray(value) ? (value as EventWishlistItemDto[]) : [];
}
