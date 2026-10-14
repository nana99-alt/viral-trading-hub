import type { TranslationKey } from "@/i18n/translations";
import type { Timestamp } from "@/types";

const MS_PER_SECOND = 1_000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/** Translate a key with optional `{count}` interpolation. */
type Translate = (
  key: TranslationKey,
  vars?: Record<string, string | number>,
) => string;

/**
 * Convert a Motoko nanosecond timestamp into a JavaScript `Date`.
 * Returns `null` for values that cannot form a valid date.
 */
export function timestampToDate(timestamp: Timestamp): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Absolute publication date, e.g. "Mar 4, 2026" / "4 Mar 2026". */
export function formatPublishedDate(
  timestamp: Timestamp,
  locale: string,
  t: Translate,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return t("date.unknown");
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Compact relative age, e.g. "2m ago" / "2 mnt lalu". */
export function formatRelativeTime(
  timestamp: Timestamp,
  locale: string,
  t: Translate,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";

  const diff = Date.now() - date.getTime();
  if (diff < MS_PER_MINUTE) return t("date.just_now");
  if (diff < MS_PER_HOUR)
    return t("date.minutes_ago", { count: Math.floor(diff / MS_PER_MINUTE) });
  if (diff < MS_PER_DAY)
    return t("date.hours_ago", { count: Math.floor(diff / MS_PER_HOUR) });
  if (diff < 30 * MS_PER_DAY)
    return t("date.days_ago", { count: Math.floor(diff / MS_PER_DAY) });
  return formatPublishedDate(timestamp, locale, t);
}

/** Full timestamp for detail views, e.g. "March 4, 2026 at 14:32". */
export function formatFullTimestamp(
  timestamp: Timestamp,
  locale: string,
  t: Translate,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return t("date.unknown");
  return date.toLocaleString(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Clamp a virality score into the 0–100 range used by the heat badge. */
export function normalizeHeat(score: bigint): number {
  const value = Number(score);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
