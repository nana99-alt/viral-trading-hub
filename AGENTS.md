# Project Guidance

## User Preferences

- Interface available in Bahasa Indonesia
- A way for users to switch between English and Indonesian
- Modern, clean reading-focused interface
- Aggregate trading content from multiple public sources
- Focus on currently-viral trading content

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Only one file may own the `declare module "@tanstack/react-router" { interface Register { router: typeof router } }` augmentation; a second one in App.tsx causes TS2717 because the two router instances have structurally distinct types. Keep the canonical router in src/frontend/src/routes.tsx and render it from App.tsx via RouterProvider.
- A file containing JSX must use a .tsx extension; a .ts file with JSX fails tsc (TS1005) and the vite/esbuild build.
- Motoko: `label` is a reserved keyword and cannot be a for-loop pattern binding; `Time.now()` already returns Int nanoseconds in mo:core 2.6.2; a backend-root file imports sibling modules as `types/content`, not `../types/content`.
- caffeineai-oql 0.8.0: a record with a collection field (e.g. topics : [Text]) needs Map.toEntityManual with .payload per field; toEntityManual takes two type parameters <K, V> that are inferable from the Map receiver; Entity.build() returns Entity.Decl.
- Reddit public .json endpoints return HTTP 403 to canister requests; CoinGecko /search/trending fails canister API compliance (unbounded, 75KB) while /coins/markets?per_page=N&page=1 passes; cryptocurrency.cv /api/news and hn.algolia.com /api/v1/search_by_date pass compliance.
- i18n lives in src/frontend/src/i18n (I18nProvider, useI18n, LanguageSwitcher, translations); I18nProvider wraps RouterProvider in App.tsx and persists the choice in localStorage under 'pulse.language'.
- Locale-aware date helpers in src/frontend/src/lib/format.ts take (timestamp, locale, t); TIME_RANGE_OPTIONS carries labelKey resolved via t() at render.
- Frontend regression suite: Vitest + jsdom + React Testing Library, run with `pnpm --dir app test`; tests live in src/frontend/src/__tests__/.
