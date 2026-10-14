# Design Brief

## Direction

Terminal Editorial — a dark, reading-first aggregator that turns a firehose of viral trading content into a calm, ranked editorial feed.

## Tone

Refined dark editorial with a terminal edge: near-black slate-green canvas, warm amber as the single "heat" signal. No fintech-navy, no purple gradients.

## Differentiation

A monospace "heat score" badge on every card turns engagement into a ranked, scannable signal — the feed reads like a wire service, not a social wall.

## Color Palette

| Token      | OKLCH         | Role                                              |
| ---------- | ------------- | ------------------------------------------------- |
| background | 0.16 0.012 165 | Dark slate-green reading canvas (dark-first)     |
| foreground | 0.94 0.008 150 | Primary text, high contrast on canvas            |
| card       | 0.205 0.014 165 | Elevated feed/sidebar surfaces                   |
| primary    | 0.78 0.16 70  | Amber "viral heat" accent — scores, active state |
| accent     | 0.78 0.16 70  | Same amber, reserved for interactive highlights  |
| muted      | 0.25 0.016 165 | Chips, dividers, secondary surfaces              |

## Typography

- Display: Space Grotesk — headlines, brand wordmark, section titles
- Body: General Sans — summaries, UI labels, controls
- Mono: Geist Mono — heat scores, timestamps, source ranks
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold`, label `text-xs font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Three-tier surface hierarchy (background → card → popover) with soft dark shadows (`shadow-subtle`, `shadow-elevated`) and a faint `inset-soft` top highlight; depth comes from layering, never from glow.

## Structural Zones

| Zone    | Background        | Border            | Notes                                              |
| ------- | ----------------- | ----------------- | -------------------------------------------------- |
| Header  | `bg-card/95` + blur | `border-b border-border` | Sticky; wordmark, search, source filter pills |
| Content | `bg-background`   | —                 | Two-column: feed list + trending sidebar; cards on `bg-card` |
| Footer  | `bg-muted/40`     | `border-t border-border` | Source attribution + refresh status          |

## Spacing & Rhythm

Generous vertical rhythm: `gap-4` between feed cards, `py-16` between major sections, `p-5` card padding, tight `space-y-1` inside metadata rows.

## Component Patterns

- Buttons: amber `bg-primary` pill for primary actions, `bg-secondary` ghost for filters; hover lifts with `shadow-subtle` + `transition-smooth`
- Cards: `rounded-xl` `bg-card` with `border border-border`, `shadow-subtle`, 3px amber left accent bar on top-engagement item
- Badges: circular monospace heat-score badge (amber fill for high scores, `bg-muted` for low), pill source chips with `text-muted-foreground`

## Motion

- Entrance: feed cards `animate-fade-in-up` staggered ~40ms via inline delay
- Hover: cards lift to `shadow-elevated` and accent bar brightens, 300ms `transition-smooth`
- Decorative: `animate-pulse-heat` on the top trending rank; `animate-shimmer` skeletons during loading

## Constraints

- Dark-first; light tokens kept in `:root` but dark is the intended experience
- Amber is the only accent — never introduce a second saturated hue
- No email notifications, no comments/discussion UI (out of scope)
- All color via semantic OKLCH tokens; no raw hex or arbitrary Tailwind colors

## Signature Detail

The monospace circular heat-score badge paired with a thin amber accent bar on the top story — a wire-service ranking motif that makes virality scannable at a glance.
