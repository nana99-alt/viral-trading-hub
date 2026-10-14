import { cn } from "@/lib/utils";
import { useI18n } from "./I18nProvider";
import { LANGUAGES, LANGUAGE_LABELS, type Language } from "./translations";

/**
 * Compact EN/ID segmented control shown in the app header. Selecting a
 * language updates the whole interface immediately and persists the choice.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <fieldset
      data-ocid="language.switcher"
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-secondary p-0.5",
        className,
      )}
    >
      <legend className="sr-only">{t("language.switcher_label")}</legend>
      {LANGUAGES.map((code: Language) => {
        const active = code === language;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLanguage(code)}
            aria-pressed={active}
            aria-label={t("language.switch_to", {
              language: LANGUAGE_LABELS[code],
            })}
            title={LANGUAGE_LABELS[code]}
            data-ocid={`language.${code}_button`}
            className={cn(
              "rounded-full px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider transition-smooth",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-primary text-primary-foreground shadow-subtle"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {code}
          </button>
        );
      })}
    </fieldset>
  );
}
