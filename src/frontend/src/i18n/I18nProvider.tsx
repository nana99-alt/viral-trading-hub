import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  LOCALES,
  type Language,
  type TranslationKey,
  translations,
} from "./translations";

const STORAGE_KEY = "pulse.language";

/** Values interpolated into a translation string, e.g. `{count}`. */
export type TranslationVars = Record<string, string | number>;

export interface I18nContextValue {
  /** Active interface language. */
  language: Language;
  /** BCP-47 locale matching the active language (e.g. "id-ID"). */
  locale: string;
  /** Switch the interface language and persist the choice. */
  setLanguage: (language: Language) => void;
  /** Translate a key, interpolating `{placeholder}` tokens. */
  t: (key: TranslationKey, vars?: TranslationVars) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/** Read the persisted language, falling back to English. */
function readStoredLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (LANGUAGES as readonly string[]).includes(stored)) {
      return stored as Language;
    }
  } catch {
    // Storage can be unavailable (private mode); fall back to the default.
  }
  return DEFAULT_LANGUAGE;
}

/** Replace `{token}` placeholders with their provided values. */
function interpolate(template: string, vars?: TranslationVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, token: string) =>
    token in vars ? String(vars[token]) : match,
  );
}

/**
 * Provides the active language, a translator and the matching locale to the
 * whole app. The choice is persisted so it survives reloads and reopening.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Persisting is best-effort; the in-memory choice still applies.
    }
  }, []);

  const locale = LOCALES[language];

  // Keep the document language and title in sync with the active language.
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translations[language]["app.title"];
  }, [language]);

  const t = useCallback(
    (key: TranslationKey, vars?: TranslationVars) =>
      interpolate(translations[language][key], vars),
    [language],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ language, locale, setLanguage, t }),
    [language, locale, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Access the active language, locale and translator. */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
