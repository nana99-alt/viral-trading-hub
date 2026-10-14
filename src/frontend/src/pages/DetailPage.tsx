import { HeatBadge } from "@/components/HeatBadge";
import { Layout } from "@/components/Layout";
import { RelatedList } from "@/components/RelatedList";
import { Button } from "@/components/ui/button";
import { useContent, useRelatedContent } from "@/hooks/useQueries";
import { useI18n } from "@/i18n";
import { formatFullTimestamp, formatRelativeTime } from "@/lib/format";
import { detailRoute } from "@/routes";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useMemo } from "react";

/**
 * Content detail page — the full story body, source metadata (name,
 * publication time, virality score), a prominent link to the original
 * article, and related coverage from the same topics.
 */
export function DetailPage({ contentId }: { contentId?: string } = {}) {
  const { locale, t } = useI18n();
  const params = detailRoute.useParams();
  const resolvedContentId = contentId ?? params.contentId;
  const id = useMemo(() => {
    try {
      return BigInt(resolvedContentId);
    } catch {
      return undefined;
    }
  }, [resolvedContentId]);

  const { data: item, isLoading, isError, refetch } = useContent(id);
  const { data: related = [] } = useRelatedContent(id);

  if (isLoading) {
    return (
      <Layout>
        <DetailSkeleton />
      </Layout>
    );
  }

  if (isError || !item) {
    return (
      <Layout>
        <div
          className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8 text-center shadow-subtle"
          data-ocid="detail.error_state"
        >
          <h1 className="font-display text-xl font-semibold text-foreground">
            {t("detail.not_found_title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("detail.not_found_body")}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void refetch()}
              data-ocid="detail.retry_button"
              className="rounded-full"
            >
              {t("detail.try_again")}
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/" search={{}} data-ocid="detail.back_link">
                {t("detail.back")}
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="mx-auto max-w-3xl" data-ocid="detail.page">
        <Link
          to="/"
          search={{}}
          data-ocid="detail.back_link"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t("detail.back")}
        </Link>

        <div className="flex items-start gap-4">
          <HeatBadge score={item.viralityScore} className="size-14 text-base" />
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                data-ocid="detail.source_link"
                className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.sourceName}
              </a>
              <span className="font-mono text-xs text-muted-foreground">
                {formatRelativeTime(item.publishedAt, locale, t)}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
              {item.title}
            </h1>
          </div>
        </div>

        <p className="mt-6 border-l-2 border-primary/50 pl-4 text-lg leading-relaxed text-muted-foreground">
          {item.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild className="rounded-full">
            <a
              href={item.articleUrl}
              target="_blank"
              rel="noreferrer"
              data-ocid="detail.read_original_link"
            >
              {t("detail.read_original")}
              <ExternalLink aria-hidden="true" className="size-4" />
            </a>
          </Button>
          <span className="font-mono text-xs text-muted-foreground">
            {formatFullTimestamp(item.publishedAt, locale, t)}
          </span>
        </div>

        {item.topics.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {item.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-border bg-muted px-3 py-1 font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                #{topic}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 max-w-none">
          {item.body
            .split(/\n{2,}/)
            .filter((paragraph) => paragraph.trim().length > 0)
            .map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="mb-4 leading-relaxed text-foreground/90"
              >
                {paragraph}
              </p>
            ))}
        </div>

        <RelatedList items={related} />
      </article>
    </Layout>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl" data-ocid="detail.loading_state">
      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      <div className="mt-6 flex items-start gap-4">
        <div className="size-14 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mt-8 space-y-3">
        {Array.from({ length: 6 }, (_, i) => `detail-skeleton-${i}`).map(
          (id) => (
            <div
              key={id}
              className="h-4 w-full animate-pulse rounded bg-muted"
            />
          ),
        )}
      </div>
    </div>
  );
}
