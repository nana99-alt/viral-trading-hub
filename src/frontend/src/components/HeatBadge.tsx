import { useI18n } from "@/i18n";
import { normalizeHeat } from "@/lib/format";
import { cn } from "@/lib/utils";

interface HeatBadgeProps {
  score: bigint;
  className?: string;
}

/**
 * Circular monospace heat-score badge — the feed's signature ranking motif.
 * High scores fill with amber; lower scores fall back to a muted surface.
 */
export function HeatBadge({ score, className }: HeatBadgeProps) {
  const { t } = useI18n();
  const heat = normalizeHeat(score);
  const isHot = heat >= 80;

  return (
    <span
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-semibold tabular-nums",
        isHot
          ? "border-primary/40 bg-primary text-primary-foreground shadow-subtle"
          : "border-border bg-muted text-muted-foreground",
        className,
      )}
      aria-label={t("heat.label", { score: heat })}
      title={t("heat.title", { score: heat })}
    >
      {heat}
    </span>
  );
}
