import { useI18n } from "@/i18n";
import { normalizeHeat } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/types";
import { Link } from "@tanstack/react-router";

interface TrendingSidebarProps {
  items: ContentItem[];
  isLoading: boolean;
}

/** Ranked "Trending Now" rail — the feed's scannable heat leaderboard. */
export function TrendingSidebar({ items, isLoading }: TrendingSidebarProps) {
  const { t } = useI18n();

  return (
    <aside
      data-ocid="trending.panel"
      className="rounded-xl border border-border bg-card p-5 shadow-subtle"
    >
      <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {t("trending.heading")}
      </h2>

      {isLoading ? (
        <ul className="space-y-3" data-ocid="trending.loading_state">
          {Array.from({ length: 6 }, (_, i) => `trending-skeleton-${i}`).map(
            (id) => (
              <li key={id} className="flex items-center gap-3">
                <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
              </li>
            ),
          )}
        </ul>
      ) : items.length === 0 ? (
        <p
          className="text-sm text-muted-foreground"
          data-ocid="trending.empty_state"
        >
          {t("trending.empty")}
        </p>
      ) : (
        <ol className="space-y-1">
          {items.slice(0, 10).map((item, index) => {
            const heat = normalizeHeat(item.viralityScore);
            const isTop = index === 0;
            return (
              <li key={item.id.toString()}>
                <Link
                  to="/content/$contentId"
                  params={{ contentId: item.id.toString() }}
                  data-ocid={`trending.item.${index + 1}`}
                  className="group flex items-start gap-3 rounded-lg px-2 py-2 transition-smooth hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    className={cn(
                      "mt-0.5 w-5 shrink-0 text-right font-mono text-sm tabular-nums",
                      isTop
                        ? "animate-pulse-heat font-semibold text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-1 w-10 overflow-hidden rounded-full bg-muted"
                      >
                        <span
                          className="heat-bar block h-full rounded-full"
                          style={{ width: `${heat}%` }}
                        />
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {heat}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}
