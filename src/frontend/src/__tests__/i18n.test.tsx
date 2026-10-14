import type { ContentItem, backendInterface } from "@/backend";
import { I18nProvider } from "@/i18n";
import { translations } from "@/i18n/translations";
import { formatFullTimestamp, formatRelativeTime } from "@/lib/format";
import { router } from "@/routes";
import { RouterProvider } from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithActor } from "./test-utils";

const STORAGE_KEY = "pulse.language";

/** Build a content item with sensible defaults for the fields under test. */
function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 1n,
    title: "Bitcoin breaks resistance",
    viralityScore: 92n,
    body: "First paragraph.\n\nSecond paragraph.",
    publishedAt: BigInt(Date.now()) * 1_000_000n,
    sourceUrl: "https://example.com/source",
    sourceName: "CoinDesk",
    summary: "A short summary of the story.",
    topics: ["bitcoin", "markets"],
    articleUrl: "https://example.com/article",
    ...overrides,
  };
}

/** A typed actor seam exposing only the methods the feed/detail pages call. */
function makeActor(
  items: ContentItem[],
  sources: { name: string; url: string; description: string }[] = [],
) {
  return {
    listViralContent: vi.fn<backendInterface["listViralContent"]>(async () =>
      structuredClone(items),
    ),
    listSources: vi.fn<backendInterface["listSources"]>(async () =>
      structuredClone(sources),
    ),
    getContent: vi.fn<backendInterface["getContent"]>(async (id) =>
      structuredClone(items.find((item) => item.id === id) ?? null),
    ),
    getRelatedContent: vi.fn<backendInterface["getRelatedContent"]>(
      async () => [],
    ),
    refreshContent: vi.fn<backendInterface["refreshContent"]>(async () => 0n),
  } satisfies Pick<
    backendInterface,
    | "listViralContent"
    | "listSources"
    | "getContent"
    | "getRelatedContent"
    | "refreshContent"
  >;
}

/**
 * Render the real app router at a given path. The router is a module
 * singleton, so we reset its location before each render.
 */
async function renderAppAt(path: string, actor: ReturnType<typeof makeActor>) {
  await router.navigate({ to: path, replace: true });
  return renderWithActor(
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>,
    actor,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("I18nProvider", () => {
  it("defaults to English when no language was ever chosen", () => {
    render(
      <I18nProvider>
        <span data-testid="probe">probe</span>
      </I18nProvider>,
    );
    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe(translations.en["app.title"]);
  });

  it("restores a persisted Indonesian choice on mount", () => {
    window.localStorage.setItem(STORAGE_KEY, "id");
    render(
      <I18nProvider>
        <span data-testid="probe">probe</span>
      </I18nProvider>,
    );
    expect(document.documentElement.lang).toBe("id");
    expect(document.title).toBe(translations.id["app.title"]);
  });
});

describe("format helpers follow the selected locale", () => {
  const t = (
    key: keyof typeof translations.en,
    vars?: Record<string, string | number>,
  ) => {
    const template = translations.en[key];
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_m, token: string) =>
      token in vars ? String(vars[token]) : _m,
    );
  };

  it("formats a full timestamp differently for en-US and id-ID", () => {
    const ts = BigInt(new Date("2026-03-04T14:32:00Z").getTime()) * 1_000_000n;
    const en = formatFullTimestamp(ts, "en-US", t);
    const id = formatFullTimestamp(ts, "id-ID", t);
    expect(en).not.toBe(id);
    expect(en).toMatch(/2026/);
    expect(id).toMatch(/2026/);
  });

  it("formats relative time through the translation layer", () => {
    const twoHoursAgo = BigInt(Date.now() - 2 * 60 * 60 * 1000) * 1_000_000n;
    expect(formatRelativeTime(twoHoursAgo, "en-US", t)).toBe("2h ago");
  });

  it("formats relative time in Indonesian for id-ID", () => {
    const twoHoursAgo = BigInt(Date.now() - 2 * 60 * 60 * 1000) * 1_000_000n;
    const idT = (
      key: keyof typeof translations.id,
      vars?: Record<string, string | number>,
    ) => {
      const template = translations.id[key];
      if (!vars) return template;
      return template.replace(/\{(\w+)\}/g, (_m, token: string) =>
        token in vars ? String(vars[token]) : _m,
      );
    };
    expect(formatRelativeTime(twoHoursAgo, "id-ID", idT)).toBe("2 jam lalu");
  });
});

describe("FeedPage language switching", () => {
  it("switches interface copy from English to Indonesian without reload", async () => {
    const user = userEvent.setup();
    const actor = makeActor(
      [makeItem()],
      [{ name: "CoinDesk", url: "https://example.com", description: "news" }],
    );
    await renderAppAt("/", actor);

    // English default.
    expect(
      await screen.findByRole("heading", { name: "Viral Now" }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search viral trading content…"),
    ).toBeInTheDocument();

    // Switch to Indonesian via the header control.
    await user.click(screen.getByTestId("language.id_button"));

    expect(
      await screen.findByRole("heading", { name: "Sedang Viral" }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Cari konten perdagangan viral…"),
    ).toBeInTheDocument();
    expect(screen.getByText("Segarkan")).toBeInTheDocument();
    expect(screen.getByText("Semua")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("id");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("id");
  });

  it("keeps the Indonesian choice after a remount (reload)", async () => {
    const user = userEvent.setup();
    const actor = makeActor([makeItem()]);
    const first = await renderAppAt("/", actor);
    await screen.findByRole("heading", { name: "Viral Now" });
    await user.click(screen.getByTestId("language.id_button"));
    await screen.findByRole("heading", { name: "Sedang Viral" });
    first.unmount();

    await renderAppAt("/", actor);
    expect(
      await screen.findByRole("heading", { name: "Sedang Viral" }),
    ).toBeInTheDocument();
  });

  it("renders the empty state in Indonesian when no stories exist", async () => {
    const user = userEvent.setup();
    const actor = makeActor([]);
    await renderAppAt("/", actor);
    await screen.findByRole("heading", { name: "Viral Now" });
    await user.click(screen.getByTestId("language.id_button"));

    expect(
      await screen.findByRole("heading", { name: "Belum ada cerita viral" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Belum ada cerita yang sedang tren."),
    ).toBeInTheDocument();
  });

  it("renders the error state in Indonesian and retries", async () => {
    const user = userEvent.setup();
    const actor = makeActor([]);
    actor.listViralContent.mockRejectedValueOnce(new Error("boom"));
    await renderAppAt("/", actor);
    await screen.findByRole("heading", { name: "Viral Now" });
    await user.click(screen.getByTestId("language.id_button"));

    expect(
      await screen.findByRole("heading", { name: "Gagal memuat umpan" }),
    ).toBeInTheDocument();
    const retry = screen.getByRole("button", { name: "Coba lagi" });
    await user.click(retry);
    await waitFor(() =>
      expect(actor.listViralContent).toHaveBeenCalledTimes(2),
    );
  });

  it("translates the header wordmark, footer and filter controls", async () => {
    const user = userEvent.setup();
    const actor = makeActor(
      [makeItem()],
      [{ name: "CoinDesk", url: "https://example.com", description: "news" }],
    );
    await renderAppAt("/", actor);
    await screen.findByRole("heading", { name: "Viral Now" });

    // English defaults for the shell and filter bar.
    expect(screen.getByText("Pulse — viral trading wire")).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Filter by time range" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();

    await user.click(screen.getByTestId("language.id_button"));

    expect(
      await screen.findByText("Pulse — kawat perdagangan viral"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", {
        name: "Filter berdasarkan rentang waktu",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Segarkan" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "24 jam" })).toBeInTheDocument();
  });

  it("shows the refreshing label in Indonesian while a refresh is pending", async () => {
    const user = userEvent.setup();
    const actor = makeActor([makeItem()]);
    let resolveRefresh: (value: bigint) => void = () => {};
    actor.refreshContent.mockImplementation(
      () =>
        new Promise<bigint>((resolve) => {
          resolveRefresh = resolve;
        }),
    );
    await renderAppAt("/", actor);
    await screen.findByRole("heading", { name: "Viral Now" });
    await user.click(screen.getByTestId("language.id_button"));
    await screen.findByRole("heading", { name: "Sedang Viral" });

    await user.click(screen.getByRole("button", { name: "Segarkan" }));
    expect(
      await screen.findByRole("button", { name: "Menyegarkan…" }),
    ).toBeDisabled();

    resolveRefresh(0n);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Segarkan" }),
      ).toBeInTheDocument(),
    );
  });

  it("translates the trending sidebar heading and empty state", async () => {
    const user = userEvent.setup();
    const actor = makeActor([]);
    await renderAppAt("/", actor);
    await screen.findByRole("heading", { name: "Viral Now" });
    expect(
      screen.getByRole("heading", { name: "Trending Now" }),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("language.id_button"));
    expect(
      await screen.findByRole("heading", { name: "Sedang Tren" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Belum ada cerita yang sedang tren."),
    ).toBeInTheDocument();
  });

  it("translates the heat badge label on a content card", async () => {
    const user = userEvent.setup();
    const actor = makeActor([makeItem({ viralityScore: 92n })]);
    await renderAppAt("/", actor);
    await screen.findByRole("heading", { name: "Viral Now" });

    // Heat badge exposes a translated accessible label.
    expect(
      await screen.findByTitle("Virality score 92/100"),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("language.id_button"));
    expect(
      await screen.findByTitle("Skor viralitas 92/100"),
    ).toBeInTheDocument();
  });

  it("translates the clear-filters action in the filtered empty state", async () => {
    const user = userEvent.setup();
    const actor = makeActor([]);
    await renderAppAt("/?q=nomatch", actor);
    await screen.findByRole("heading", { name: "Viral Now" });

    expect(
      await screen.findByRole("heading", {
        name: "No viral stories match your filters",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Clear filters" }),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("language.id_button"));
    expect(
      await screen.findByRole("heading", {
        name: "Tidak ada cerita viral yang cocok dengan filter Anda",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Hapus filter" }),
    ).toBeInTheDocument();
  });
});

describe("ContentDetailPage language switching", () => {
  it("translates detail labels and the not-found state", async () => {
    const user = userEvent.setup();
    const actor = makeActor([makeItem({ id: 7n })]);
    await renderAppAt("/content/7", actor);

    expect(
      await screen.findByRole("heading", { name: "Bitcoin breaks resistance" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Read original/ }),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("language.id_button"));
    expect(
      await screen.findByRole("link", { name: /Baca aslinya/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Kembali ke umpan/ }),
    ).toBeInTheDocument();
  });

  it("shows the not-found state in Indonesian for a missing story", async () => {
    const user = userEvent.setup();
    const actor = makeActor([]);
    await renderAppAt("/content/999", actor);

    expect(
      await screen.findByRole("heading", { name: "Story not found" }),
    ).toBeInTheDocument();
    await user.click(screen.getByTestId("language.id_button"));
    expect(
      await screen.findByRole("heading", { name: "Cerita tidak ditemukan" }),
    ).toBeInTheDocument();
  });

  it("translates the related-stories heading", async () => {
    const user = userEvent.setup();
    const actor = makeActor([makeItem({ id: 7n })]);
    actor.getRelatedContent.mockResolvedValue([
      makeItem({ id: 8n, title: "Ether rallies" }),
    ]);
    await renderAppAt("/content/7", actor);

    expect(
      await screen.findByRole("heading", { name: "Related stories" }),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("language.id_button"));
    expect(
      await screen.findByRole("heading", { name: "Cerita terkait" }),
    ).toBeInTheDocument();
  });
});

describe("LanguageSwitcher accessibility", () => {
  it("exposes pressed state and translated labels", async () => {
    const user = userEvent.setup();
    const { LanguageSwitcher } = await import("@/i18n/LanguageSwitcher");
    render(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>,
    );
    const en = screen.getByTestId("language.en_button");
    const id = screen.getByTestId("language.id_button");
    expect(en).toHaveAttribute("aria-pressed", "true");
    expect(id).toHaveAttribute("aria-pressed", "false");
    expect(en).toHaveAccessibleName("Switch language to English");

    await user.click(id);
    expect(id).toHaveAttribute("aria-pressed", "true");
    expect(en).toHaveAttribute("aria-pressed", "false");
    expect(id).toHaveAccessibleName("Ganti bahasa ke Bahasa Indonesia");
  });
});
