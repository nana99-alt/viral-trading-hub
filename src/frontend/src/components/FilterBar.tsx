import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  type SourceDescriptor,
  TIME_RANGE_OPTIONS,
  type TimeRangeKey,
} from "@/types";
import { RefreshCw } from "lucide-react";

interface FilterBarProps {
  /** Available sources from the backend. */
  sources: SourceDescriptor[];
  /** Currently selected source name, or undefined for "All". */
  source: string | undefined;
  /** Currently selected time-range key. */
  range: TimeRangeKey;
  onSourceChange: (source: string | undefined) => void;
  onRangeChange: (range: TimeRangeKey) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

/** Turn a source name into a stable, marker-safe slug. */
function sourceSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/**
 * Source pills, time-range select and refresh action. All state is owned by
 * the feed page and mirrored into the URL, so this component is controlled.
 */
export function FilterBar({
  sources,
  source,
  range,
  onSourceChange,
  onRangeChange,
  onRefresh,
  isRefreshing,
}: FilterBarProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center gap-2 pb-1">
      <FilterPill
        active={source === undefined}
        onClick={() => onSourceChange(undefined)}
        marker="feed.filter.all"
      >
        {t("filter.all")}
      </FilterPill>
      {sources.map((descriptor) => (
        <FilterPill
          key={descriptor.name}
          active={source === descriptor.name}
          onClick={() => onSourceChange(descriptor.name)}
          marker={`feed.filter.${sourceSlug(descriptor.name)}`}
        >
          {descriptor.name}
        </FilterPill>
      ))}

      <div className="ml-auto flex items-center gap-2">
        <select
          value={range}
          onChange={(event) =>
            onRangeChange(event.target.value as TimeRangeKey)
          }
          aria-label={t("filter.time_range_label")}
          data-ocid="feed.time_range_select"
          className="h-8 rounded-full border border-input bg-background px-3 text-xs text-foreground transition-smooth focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {TIME_RANGE_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          data-ocid="feed.refresh_button"
          className="rounded-full"
        >
          <RefreshCw
            aria-hidden="true"
            className={cn("size-3.5", isRefreshing && "animate-spin")}
          />
          {isRefreshing ? t("filter.refreshing") : t("filter.refresh")}
        </Button>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  marker,
  children,
}: {
  active: boolean;
  onClick: () => void;
  marker: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-ocid={marker}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary/40 bg-primary text-primary-foreground shadow-subtle"
          : "border-border bg-secondary text-secondary-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
