import { ContentDetailPage } from "@/pages/ContentDetailPage";
import { FeedPage } from "@/pages/FeedPage";
import type { TimeRangeKey } from "@/types";
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

/** Search params for the feed route — the shareable filter state. */
export interface FeedSearch {
  q?: string;
  source?: string;
  range?: TimeRangeKey;
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

export const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>): FeedSearch => ({
    q: typeof search.q === "string" && search.q !== "" ? search.q : undefined,
    source:
      typeof search.source === "string" && search.source !== ""
        ? search.source
        : undefined,
    range:
      search.range === "24h" || search.range === "7d" || search.range === "30d"
        ? search.range
        : undefined,
  }),
  component: FeedPage,
});

export const detailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/content/$contentId",
  component: ContentDetailPage,
});

const routeTree = rootRoute.addChildren([feedRoute, detailRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
