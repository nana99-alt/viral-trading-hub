import { LanguageSwitcher, useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Shared shell                                                        */
/* ------------------------------------------------------------------ */

interface LayoutProps {
  children: ReactNode;
  /** Controlled search value shown in the sticky header. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Optional source filter pills rendered under the header. */
  filterBar?: ReactNode;
}

/**
 * Shared application shell: sticky header with wordmark, language switcher
 * and search, a responsive two-column content area, and an attribution footer.
 */
export function Layout({
  children,
  searchValue,
  onSearchChange,
  filterBar,
}: LayoutProps) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <Link
              to="/"
              data-ocid="nav.home_link"
              className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full bg-primary shadow-subtle"
              />
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                {t("app.wordmark")}
              </span>
            </Link>

            <LanguageSwitcher className="order-2 sm:order-none" />

            <div className="relative order-3 w-full sm:order-none sm:ml-auto sm:w-full sm:max-w-md">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={searchValue ?? ""}
                onChange={(event) => onSearchChange?.(event.target.value)}
                placeholder={t("search.placeholder")}
                aria-label={t("search.label")}
                data-ocid="feed.search_input"
                className={cn(
                  "h-10 w-full rounded-full border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground",
                  "transition-smooth focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                )}
              />
            </div>
          </div>

          {filterBar}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>

      <footer className="border-t border-border bg-muted/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p className="font-mono text-xs uppercase tracking-widest">
            {t("app.tagline")}
          </p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            © {new Date().getFullYear()}. Built with love using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
