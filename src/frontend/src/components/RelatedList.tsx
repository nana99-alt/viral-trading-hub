import { ContentCard } from "@/components/ContentCard";
import { useI18n } from "@/i18n";
import type { ContentItem } from "@/types";

interface RelatedListProps {
  items: ContentItem[];
  /** Maximum number of related stories to render. */
  limit?: number;
}

/**
 * "Related stories" rail shown beneath the main article. Each entry links to
 * its own detail page through the shared `ContentCard`.
 */
export function RelatedList({ items, limit = 4 }: RelatedListProps) {
  const { t } = useI18n();

  if (items.length === 0) return null;

  return (
    <section
      className="mt-12 border-t border-border pt-8"
      aria-labelledby="related-heading"
      data-ocid="detail.related_section"
    >
      <h2
        id="related-heading"
        className="mb-4 font-display text-lg font-semibold tracking-tight text-foreground"
      >
        {t("detail.related_heading")}
      </h2>
      <div className="flex flex-col gap-4">
        {items.slice(0, limit).map((item, index) => (
          <ContentCard
            key={item.id.toString()}
            item={item}
            index={index}
            markerIndex={index + 1}
          />
        ))}
      </div>
    </section>
  );
}
