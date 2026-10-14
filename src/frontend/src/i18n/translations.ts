/**
 * Translation dictionaries for the two supported interface languages.
 *
 * English is the canonical shape: every other locale must provide the same
 * keys, which `TranslationKey` enforces at compile time.
 */

export const LANGUAGES = ["en", "id"] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "id";

/** BCP-47 locale used for date/time formatting per interface language. */
export const LOCALES: Record<Language, string> = {
  en: "en-US",
  id: "id-ID",
};

/** Human-readable language names, always shown in their own language. */
export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

const en = {
  "app.title": "Pulse — Viral Trading Wire",
  "app.description":
    "A ranked, reading-first feed of the trading content going viral right now.",
  "app.wordmark": "PULSE",
  "app.tagline": "Pulse — viral trading wire",

  "language.switcher_label": "Language",
  "language.switch_to": "Switch language to {language}",

  "search.placeholder": "Search viral trading content…",
  "search.label": "Search viral trading content",

  "feed.heading": "Viral Now",
  "feed.section_label": "Viral content feed",
  "feed.loading": "Loading",
  "feed.story_count": "{count} stories",
  "feed.story_count_one": "{count} story",

  "feed.empty_filtered_title": "No viral stories match your filters",
  "feed.empty_filtered_body":
    "Try clearing the search or widening the time range, then refresh the feed.",
  "feed.empty_title": "No viral stories yet",
  "feed.empty_body":
    "Pull the latest trading content from the sources to get started.",
  "feed.clear_filters": "Clear filters",

  "feed.error_title": "Couldn't load the feed",
  "feed.error_body": "The content service didn't respond. Please try again.",
  "feed.retry": "Retry",

  "filter.all": "All",
  "filter.time_range_label": "Filter by time range",
  "filter.refresh": "Refresh",
  "filter.refreshing": "Refreshing…",

  "range.all": "All time",
  "range.24h": "24 hours",
  "range.7d": "7 days",
  "range.30d": "30 days",

  "trending.heading": "Trending Now",
  "trending.empty": "No trending stories yet.",

  "heat.label": "Virality score {score} out of 100",
  "heat.title": "Virality score {score}/100",

  "detail.back": "Back to feed",
  "detail.read_original": "Read original",
  "detail.related_heading": "Related stories",
  "detail.not_found_title": "Story not found",
  "detail.not_found_body":
    "This story may have been removed or the link is invalid.",
  "detail.try_again": "Try again",

  "date.unknown": "Unknown date",
  "date.just_now": "just now",
  "date.minutes_ago": "{count}m ago",
  "date.hours_ago": "{count}h ago",
  "date.days_ago": "{count}d ago",
} as const;

export type TranslationKey = keyof typeof en;

const id: Record<TranslationKey, string> = {
  "app.title": "Pulse — Kawat Perdagangan Viral",
  "app.description":
    "Umpan berperingkat yang mengutamakan bacaan dari konten perdagangan yang sedang viral saat ini.",
  "app.wordmark": "PULSE",
  "app.tagline": "Pulse — kawat perdagangan viral",

  "language.switcher_label": "Bahasa",
  "language.switch_to": "Ganti bahasa ke {language}",

  "search.placeholder": "Cari konten perdagangan viral…",
  "search.label": "Cari konten perdagangan viral",

  "feed.heading": "Sedang Viral",
  "feed.section_label": "Umpan konten viral",
  "feed.loading": "Memuat",
  "feed.story_count": "{count} cerita",
  "feed.story_count_one": "{count} cerita",

  "feed.empty_filtered_title":
    "Tidak ada cerita viral yang cocok dengan filter Anda",
  "feed.empty_filtered_body":
    "Coba hapus pencarian atau perlebar rentang waktu, lalu segarkan umpan.",
  "feed.empty_title": "Belum ada cerita viral",
  "feed.empty_body":
    "Tarik konten perdagangan terbaru dari sumber untuk memulai.",
  "feed.clear_filters": "Hapus filter",

  "feed.error_title": "Gagal memuat umpan",
  "feed.error_body": "Layanan konten tidak merespons. Silakan coba lagi.",
  "feed.retry": "Coba lagi",

  "filter.all": "Semua",
  "filter.time_range_label": "Filter berdasarkan rentang waktu",
  "filter.refresh": "Segarkan",
  "filter.refreshing": "Menyegarkan…",

  "range.all": "Sepanjang waktu",
  "range.24h": "24 jam",
  "range.7d": "7 hari",
  "range.30d": "30 hari",

  "trending.heading": "Sedang Tren",
  "trending.empty": "Belum ada cerita yang sedang tren.",

  "heat.label": "Skor viralitas {score} dari 100",
  "heat.title": "Skor viralitas {score}/100",

  "detail.back": "Kembali ke umpan",
  "detail.read_original": "Baca aslinya",
  "detail.related_heading": "Cerita terkait",
  "detail.not_found_title": "Cerita tidak ditemukan",
  "detail.not_found_body":
    "Cerita ini mungkin telah dihapus atau tautannya tidak valid.",
  "detail.try_again": "Coba lagi",

  "date.unknown": "Tanggal tidak diketahui",
  "date.just_now": "baru saja",
  "date.minutes_ago": "{count} mnt lalu",
  "date.hours_ago": "{count} jam lalu",
  "date.days_ago": "{count} hr lalu",
};

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  id,
};
