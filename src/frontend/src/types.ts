import type {
  ContentFilter as BackendContentFilter,
  ContentId,
  ContentItem,
  SourceDescriptor,
  TimeRange,
  Timestamp,
} from "@/backend";
import type { TranslationKey } from "@/i18n/translations";

export type { ContentId, ContentItem, SourceDescriptor, TimeRange, Timestamp };

/**
 * UI-facing filter shape. Mirrors the backend `ContentFilter` but keeps the
 * optional fields explicit so the feed can build a partial filter object.
 */
export interface ContentFilter {
  keyword?: string;
  source?: string;
  timeRange?: TimeRange;
}

/** Named time windows offered by the feed's range control. */
export type TimeRangeKey = "all" | "24h" | "7d" | "30d";

/**
 * Time-range options paired with their translation keys. Labels are resolved
 * at render time through `useI18n` so they follow the active language.
 */
export const TIME_RANGE_OPTIONS: ReadonlyArray<{
  key: TimeRangeKey;
  labelKey: TranslationKey;
}> = [
  { key: "all", labelKey: "range.all" },
  { key: "24h", labelKey: "range.24h" },
  { key: "7d", labelKey: "range.7d" },
  { key: "30d", labelKey: "range.30d" },
];

const HOUR_NS = 3_600_000_000_000n;
const DAY_NS = 24n * HOUR_NS;

/** Convert a named window into the backend `TimeRange` (or undefined for all). */
export function timeRangeToFilter(
  key: TimeRangeKey,
  now: bigint = BigInt(Date.now()) * 1_000_000n,
): TimeRange | undefined {
  switch (key) {
    case "24h":
      return { from: now - DAY_NS };
    case "7d":
      return { from: now - 7n * DAY_NS };
    case "30d":
      return { from: now - 30n * DAY_NS };
    default:
      return undefined;
  }
}

/** Narrow the UI filter into the exact backend `ContentFilter` record. */
export function toBackendFilter(filter: ContentFilter): BackendContentFilter {
  return {
    keyword: filter.keyword,
    source: filter.source,
    timeRange: filter.timeRange,
  };
}
