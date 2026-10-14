import { ContentCard } from "@/components/ContentCard";
import { FilterBar } from "@/components/FilterBar";
import { Layout } from "@/components/Layout";
import { TrendingSidebar } from "@/components/TrendingSidebar";
import { Button } from "@/components/ui/button";
import {
  useRefreshContent,
  useSources,
  useViralContent,
} from "@/hooks/useQueries";
import { useI18n } from "@/i18n";
import {
  type ContentFilter,
  TIME_RANGE_OPTIONS,
  type TimeRangeKey,
  timeRangeToFilter,
} from "@/types";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/** Search params mirrored into the URL so a filtered view can be shared. */
interface FeedSearch {
  q?: string;
  source?: string;
  range?: TimeRangeKey;
}

/** Narrow an arbitrary search value into a valid time-range key. */
function normalizeRange(value: unknown): TimeRangeKey {
  return TIME_RANGE_OPTIONS.some((option) => option.key === value)
    ? (value as TimeRangeKey)
    : "all";
}

/**
 * Feed page — a ranked list of viral trading content. Search keyword, source
 * and time-range filters live in the URL so a filtered view can be shared.
 */
export function FeedPage() {
  const { t } = useI18n();
  const search = useSearch({ from: "/" }) as FeedSearch;
  const navigate = useNavigate();

  const keyword = search.q ?? "";
  const source = search.source;
  const range = normalizeRange(search.range);

  // Local draft keeps typing responsive; it syncs into the URL after a pause.
  const [draft, setDraft] = useState(keyword);
  useEffect(() => {
    setDraft(keyword);
  }, [keyword]);

  useEffect(() => {
    if (draft === keyword) return;
    const timer = window.setTimeout(() => {
      void navigate({
        to: "/",
        search: (prev) => ({ ...prev, q: draft.trim() || undefined }),
        replace: true,
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [draft, keyword, navigate]);

  const filter = useMemo<ContentFilter>(
    () => ({
      keyword: keyword.trim() || undefined,
      source,
      timeRange: timeRangeToFilter(range),
    }),
    [keyword, source, range],
  );

  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
  } = useViralContent(filter);
  const { data: sources = [] } = useSources();
  const refresh = useRefreshContent();

  const trending = useMemo(
    () => [...items].sort((a, b) => Number(b.viralityScore - a.viralityScore)),
    [items],
  );

  const setSource = (next: string | undefined) => {
    void navigate({
      to: "/",
      search: (prev) => ({ ...prev, source: next }),
      replace: true,
    });
  };

  const setRange = (next: TimeRangeKey) => {
    void navigate({
      to: "/",
      search: (prev) => ({ ...prev, range: next === "all" ? undefined : next }),
      replace: true,
    });
  };

  const clearFilters = () => {
    setDraft("");
    void navigate({ to: "/", search: {}, replace: true });
  };

  const hasFilters =
    keyword.trim() !== "" || source !== undefined || range !== "all";

  return (
    <Layout
      searchValue={draft}
      onSearchChange={setDraft}
      filterBar={
        <FilterBar
          sources={sources}
          source={source}
          range={range}
          onSourceChange={setSource}
          onRangeChange={setRange}
          onRefresh={() => refresh.mutate()}
          isRefreshing={refresh.isPending}
        />
      }
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-label={t("feed.section_label")} data-ocid="feed.section">
          <div className="mb-5 flex items-baseline justify-between">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {t("feed.heading")}
            </h1>
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {isLoading
                ? t("feed.loading")
                : t(
                    items.length === 1
                      ? "feed.story_count_one"
                      : "feed.story_count",
                    { count: items.length },
                  )}
            </span>
          </div>

          {isLoading ? (
            <FeedSkeleton />
          ) : isError ? (
            <ErrorState onRetry={() => void refetch()} />
          ) : items.length === 0 ? (
            <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item, index) => (
                <ContentCard
                  key={item.id.toString()}
                  item={item}
                  index={index}
                  featured={index === 0}
                  markerIndex={index + 1}
                />
              ))}
            </div>
          )}
        </section>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <TrendingSidebar items={trending} isLoading={isLoading} />
        </div>
      </div>
    </Layout>
  );
}

function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-4" data-ocid="feed.loading_state">
      {Array.from({ length: 5 }, (_, i) => `feed-skeleton-${i}`).map((id) => (
        <div
          key={id}
          className="rounded-xl border border-border bg-card p-5 shadow-subtle"
        >
          <div className="flex items-start gap-4">
            <div className="size-11 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  const { t } = useI18n();

  return (
    <div
      className="rounded-xl border border-dashed border-border bg-card p-12 text-center"
      data-ocid="feed.empty_state"
    >
      <Flame
        aria-hidden="true"
        className="mx-auto size-8 text-muted-foreground"
      />
      <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
        {hasFilters ? t("feed.empty_filtered_title") : t("feed.empty_title")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {hasFilters ? t("feed.empty_filtered_body") : t("feed.empty_body")}
      </p>
      {hasFilters && (
        <Button
          type="button"
          variant="secondary"
          onClick={onClear}
          data-ocid="feed.clear_filters_button"
          className="mt-5 rounded-full"
        >
          {t("feed.clear_filters")}
        </Button>
      )}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();

  return (
    <div
      className="rounded-xl border border-border bg-card p-12 text-center shadow-subtle"
      data-ocid="feed.error_state"
    >
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t("feed.error_title")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("feed.error_body")}
      </p>
      <Button
        type="button"
        onClick={onRetry}
        data-ocid="feed.retry_button"
        className="mt-5 rounded-full"
      >
        {t("feed.retry")}
      </Button>
    </div>
  );
}
