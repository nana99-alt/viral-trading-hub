import { HeatBadge } from "@/components/HeatBadge";
import { useI18n } from "@/i18n";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/types";
import { Link } from "@tanstack/react-router";

interface ContentCardProps {
  item: ContentItem;
  /** Renders the amber left accent bar reserved for the top story. */
  featured?: boolean;
  /** Stagger index for the entrance animation. */
  index?: number;
  /** Deterministic test marker suffix, e.g. "1". */
  markerIndex: number;
}

/**
 * Ranked feed card: heat badge, source + relative time, title, summary and
 * topic tags. The whole card links to the content detail route.
 */
export function ContentCard({
  item,
  featured = false,
  index = 0,
  markerIndex,
}: ContentCardProps) {
  const { locale, t } = useI18n();

  return (
    <Link
      to="/content/$contentId"
      params={{ contentId: item.id.toString() }}
      data-ocid={`feed.item.${markerIndex}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl border border-border bg-card p-5 shadow-subtle transition-smooth animate-fade-in-up",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      {featured && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[3px] bg-primary"
        />
      )}

      <div className="flex items-start gap-4">
        <HeatBadge score={item.viralityScore} />

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {item.sourceName}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {formatRelativeTime(item.publishedAt, locale, t)}
            </span>
          </div>

          <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
            {item.title}
          </h3>

          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {item.summary}
          </p>

          {item.topics.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70"
                >
                  #{topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
