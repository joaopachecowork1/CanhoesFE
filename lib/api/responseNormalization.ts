import type {
  CategoryProposalDto,
  EventWishlistItemDto,
  MeasureProposalDto,
  ProposalsByStatusDto,
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

function flattenStatusBuckets<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  const buckets = [record.pending, record.approved, record.rejected]
    .flatMap((bucket) => (Array.isArray(bucket) ? (bucket as T[]) : []));

  if (buckets.length > 0) return buckets;

  const direct = readArray<T>(value, [
    "items",
    "data",
    "results",
    "proposals",
    "categoryProposals",
    "measureProposals",
  ]);
  if (direct.length > 0) return direct;

  const nestedKeys = ["proposals", "categoryProposals", "measureProposals"] as const;
  for (const key of nestedKeys) {
    const nested = record[key];
    const nestedBuckets = flattenStatusBuckets<T>(nested);
    if (nestedBuckets.length > 0) return nestedBuckets;
  }

  return [];
}

export function normalizeCategoryProposalList(
  value: unknown
): CategoryProposalDto[] {
  return flattenStatusBuckets<CategoryProposalDto>(value);
}

export function normalizeMeasureProposalList(
  value: unknown
): MeasureProposalDto[] {
  return flattenStatusBuckets<MeasureProposalDto>(value);
}

export function normalizeProposalsByStatus<T>(
  value: unknown
): ProposalsByStatusDto<T> {
  if (Array.isArray(value)) {
    return {
      pending: value as T[],
      approved: [],
      rejected: [],
    };
  }

  if (!value || typeof value !== "object") {
    return {
      pending: [],
      approved: [],
      rejected: [],
    };
  }

  const record = value as Record<string, unknown>;
  return {
    pending: Array.isArray(record.pending) ? (record.pending as T[]) : [],
    approved: Array.isArray(record.approved) ? (record.approved as T[]) : [],
    rejected: Array.isArray(record.rejected) ? (record.rejected as T[]) : [],
  };
}
