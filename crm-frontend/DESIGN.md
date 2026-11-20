---
colors:
  ivory: "#FAF9F5"
  white: "#FFFFFF"
  sidebar: "#F5F4ED"
  muted: "#F0EEE6"
  slate: "#141413"
  slate-hover: "#30302E"
  text-secondary: "#3D3D3A"
  text-muted: "#5E5D59"
  text-tertiary: "#73726C"
  text-disabled: "#9C9A92"
  input-border: "#87867F"
  tooltip-label: "#C2C0B6"
  clay: "#D97757"
  clay-700: "#A9583E"
  clay-800: "#7F3F27"
  blue: "#2A78D6"
  oat: "#E3DACC"
  coral: "#EBCECE"
  heather: "#CBCADB"
  cactus: "#BCD1CA"
  fig: "#C46686"
  green-500: "#558A42"
  violet-500: "#6B4D9E"
  red-500: "#B83A3A"
  highlight: "#F7E7DE"
  status-neutral-bg: "#F0EEE6"
  status-neutral-fg: "#5E5D59"
  status-info-bg: "#E2ECF6"
  status-info-fg: "#245E99"
  status-success-bg: "#E6EEDF"
  status-success-fg: "#3D6630"
  status-warning-bg: "#F7E7DE"
  status-warning-fg: "#9A4A2E"
  status-error-bg: "#F4E1E1"
  status-error-fg: "#973232"
  status-note-bg: "#EAE6F1"
  status-note-fg: "#5A4282"
  tag-yellow: "#AE9229"
  tag-blue: "#6898C8"
  border: "rgba(31,30,29,0.15)"
  border-subtle: "rgba(31,30,29,0.10)"
  border-strong: "rgba(31,30,29,0.30)"
  sidebar-active: "rgba(115,114,108,0.14)"
  sidebar-hover: "rgba(115,114,108,0.10)"
  overlay: "rgba(20,20,19,0.40)"
typography:
  sans:
    fontFamily: "'Public Sans Variable', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  serif:
    fontFamily: "'Source Serif 4 Variable', Georgia, 'Times New Roman', Times, serif"
  mono:
    fontFamily: "'Geist Mono Variable', 'SF Mono', Monaco, 'Courier New', monospace"
rounded:
  xs: 4px
  sm: 8px
  md: 10px
  lg: 12px
  xl: 16px
  full: 9999px
---

# Design

The "Hearth" system (2026-11): a warm, quiet back-office look built from the
Hearth CRM design canvas (Dashboard, Users list, User details) and its brand
colour/typography references. Register: product (see `../PRODUCT.md`).

- **Source of truth for values:** `docs/design/2026-11-hearth/tokens.json`
  (every token, with WCAG contrast ratios and which values are derived).
- **Implementation:** `src/index.css` (tokens) → `src/components/ui/*`
  (primitives) → `src/components/shared/*` (page molecules).
- **Migration plan and decisions:** `docs/design/2026-11-hearth/PLAN.md`.

`components/ui/` is **owned locally**. The previous system was a clone of the
phmcare web-app; that coupling is dropped — edit primitives here.

## Principles

1. **Warm and flat.** Ivory canvas, white panels, warm grays only (never cool
   or neutral grays). Separation by hairline borders, never card shadows.
2. **Serif for what you read first, sans for what you work with.** Page
   titles, panel titles and big numbers are serif; everything else is sans.
3. **One accent.** Clay marks the brand and charts. It is never body text on
   white (3.12:1) — use `text-link` (`#A9583E`) when clay must be text.
4. **Status is a pill.** Tinted background, dark ink, a dot (or an icon for
   outcomes). Never colour alone: the label is always present.
5. **Honest data.** No invented metrics, deltas or trends. Demo data carries a
   "Dados de demonstração" pill.

## Template vs brand reference

Where the brand reference and the Hearth template disagree, **the template
wins** (it is the chosen design): body 14px not 16, display 34/400 not 38/330,
tertiary green/violet used for status and charts. Also deliberate deviations
from the template, for accessibility:

| Template | Here | Why |
| --- | --- | --- |
| input border `rgba(31,30,29,.3)` (1.90:1) | `#87867F` (3.65:1) | WCAG 1.4.11 — a white field on Ivory has no other boundary |
| sidebar group label `#73726C` (4.38:1) | `#5E5D59` | AA at 12px |
| tag dots yellow/sky/gray raw | `#AE9229` / `#6898C8` / `#87867F` | ≥3:1 on white |
| proprietary sans/serif | Public Sans / Source Serif 4 (OFL) | licensing; Georgia has no tabular figures, Segoe UI has no 500 |
| tabs without tabpanel semantics | Radix Tabs | keyboard + screen reader |
| chart via SVG `viewBox` (text scales) | fixed-px chart text | legibility |
| sidebar stacked above content on mobile | sheet + 56px top bar | a daily tool can't scroll past navigation |

## Colour

| Role | Utility | Value |
| --- | --- | --- |
| page canvas, row hover | `bg-background` | `#FAF9F5` |
| panels, tables, inputs | `bg-card` | `#FFFFFF` |
| navigation | `bg-sidebar` | `#F5F4ED` |
| note cards, disabled fields | `bg-surface-sunken` | `#F5F4ED` |
| chips, tracks, button hover, skeleton | `bg-muted` / `bg-accent` | `#F0EEE6` |
| text | `text-foreground` | `#141413` (Slate) |
| secondary text (nav, chips, prose) | `text-foreground-secondary` | `#3D3D3A` |
| meta, `th`, `dt`, sublines | `text-muted-foreground` | `#5E5D59` |
| placeholder, ticks — white/ivory only | `text-foreground-tertiary` | `#73726C` |
| links | `text-link` → hover `text-link-hover` | `#A9583E` → `#7F3F27` |
| structural border | `border-border` | `rgba(31,30,29,.15)` |
| row dividers, grid | `border-border-subtle` | `rgba(31,30,29,.10)` |
| outline buttons, dashed add | `border-border-strong` | `rgba(31,30,29,.30)` |
| fields, checkbox, switch-off | `border-input` | `#87867F` |
| focus | `outline-ring` | `#2A78D6` |
| brand accent | `bg-brand` / `text-brand-strong` | `#D97757` / `#A9583E` |

**Actions:** primary = Slate fill, Ivory text, hover `#30302E`. Secondary =
white with the strong hairline, hover `#F0EEE6`. Ghost = transparent, hover
`#F0EEE6`. Destructive = outlined red ink (`#973232`), hover `#F4E1E1`; a
solid red fill only on the confirm button of a delete dialog.

**Status** (`shared/StatusBadge`, tone → bg / fg / dot):

| Tone | bg | fg | dot | CRM use |
| --- | --- | --- | --- | --- |
| neutral | `#F0EEE6` | `#5E5D59` | `#9C9A92` | inativo, lida, até 6/9 meses |
| info | `#E2ECF6` | `#245E99` | `#2A78D6` | por ler, atualizações |
| success | `#E6EEDF` | `#3D6630` | `#558A42` | ativo |
| warning | `#F7E7DE` | `#9A4A2E` | `#D97757` | até 3 meses, pausado |
| error | `#F4E1E1` | `#973232` | `#B83A3A` | expirado/terminado, cancelado, eliminação |
| note | `#EAE6F1` | `#5A4282` | `#6B4D9E` | configuração |
| chip (no status) | `#F0EEE6` | `#3D3D3A` | — | operadora, tipo, categorias |

Tone mapping lives in `lib/status.ts`, `lib/notifications/flag-style.ts` and
the Events action map — pick a tone, never a colour. Service-end urgency is
one rule everywhere: **expired = error, ≤ 90 days = warning, otherwise
neutral**, always with text ("Terminado", "Faltam 12 dias").

**Charts:** series `chart-1..5` = Clay, Blue, Green, Fig, Violet
(CVD-validated). Grid `border-subtle`, baseline `border-strong`, ticks 12px
tertiary, bars rounded `4 4 0 0` max 48px wide, area fill 12%, line 2px,
tooltip Slate/Ivory r8. Values are always printed (no hover-only data).

**Tags** (user-chosen, no meaning): `#F0EEE6` chip, 13px, 8px dot in
`tag-{red,orange,yellow,green,blue,purple,gray}`.

**Avatars:** initials on `avatar-1..4` (Oat, Coral, Heather, Cactus) chosen
by `id % 4`; `aria-hidden` when the name is next to it.

**Light only.** `color-scheme: light`; there is no dark mode. Don't add
`dark:` utilities.

## Typography

Public Sans Variable (UI), Source Serif 4 Variable (display, optical sizing
on), Geist Mono Variable for codes only (NIF, IBAN, acesso/CPE, Nº serviço).
Dates, euros and phone numbers are **tabular sans**, not mono. Letter-spacing
is always 0. Nothing below 11px; no arbitrary `text-[…]` sizes in feature
code.

| Utility | Font | Size / line | Weight | Use |
| --- | --- | --- | --- | --- |
| `type-display` (`type-page-title`) | serif | 34 / 40 | 400 | page `<h1>` (28/34 below 640px) |
| `type-metric` | serif | 34 / 38 | 400 tnum | dashboard KPI values |
| `type-title` | serif | 28 / 34 | 400 tnum | profile `<h1>`, compact KPIs, login |
| `type-figure` | serif | 24 / 30 | 400 tnum | headline figure in a panel header |
| `type-heading` | serif | 22 / 28 | 500 | panel `<h2>`, wordmark |
| `type-heading-sm` | serif | 20 / 26 | 500 | side cards, dialog/sheet titles |
| `type-lead` | sans | 15 / 22 | 400 | page subline (muted) |
| `type-section` | sans | 14 / 20 | 500 | small titles inside primitives |
| `type-body` | sans | 14 / 20 | 400 | default |
| `type-nav` | sans | 14 / 20 | 400 (active 500) | sidebar, tabs, breadcrumb |
| `type-control` | sans | 14 / 20 | 500 | buttons, select triggers |
| `type-dense` (`type-meta`) | sans | 13 / 18 | 400 | row second lines, dates, helper |
| `type-label` | sans | 13 / 18 | 500 | form labels |
| `type-caption` | sans | 12 / 16 | 400 | dt, count chips, ticks, tooltips |
| `type-eyebrow` | sans | 12 / 16 | 500 | table headers, pills (no uppercase) |
| `type-mono` | mono | 13 / 20 | 400 tnum | codes and ids |
| `type-kbd` | mono | 11 / 16 | 500 | keys |

**Numbers:** pt-PT always — `formatCurrency` ("128,40 €"), `Intl` grouping
("2 418"), dates "28 nov. 2026" / "28/11/2026". Never the template's en-US
"$128.4k".

## Space, size, radius, elevation

- **Page:** padding 32 40 48 (≥1024), 28 24 40 (768–1023), 20 16 32 (<768);
  content column max 1200px, left-aligned; sections 24 apart, grid gap 16.
- **Cards:** padding 24 (KPI 20); table cards `24 0 8` with a 24px inset on
  the first/last cell; cells padding 12.
- **Controls:** 40 default, 44 toolbars/search/login, 32 `sm` (dialogs,
  inline edit, in-table actions); icon buttons 40 / 36 / 28. Coarse pointers
  get 44px hit areas on icon-only buttons and pagination.
- **Radii:** 4 bars/checkbox · 8 nav, icon buttons, menu items, tooltip ·
  10 buttons and fields · 12 menus, popovers, toasts, note cards · 16 cards
  and dialogs · full for pills, avatars and dots.
- **Borders:** hairline 0.5px by default (`--default-border-width`); 1px for
  chart axes, 2px for the active tab underline. Dashed only for "+ Adicionar"
  chips and drop zones.
- **Elevation:** none on cards, tables, sidebar. `shadow-1` menus, popovers,
  toasts; `shadow-2` dialogs and sheets over a 40% Slate scrim.
- **Focus:** `outline 2px solid #2A78D6`, offset 2, everywhere (no box-shadow
  rings — they vanish in forced-colours mode).
- **Motion:** 150ms standard easing on colour/border; overlays fade + 4px
  slide; `prefers-reduced-motion` zeroes all but spinners.

## Shell

- **Sidebar** 232px on `#F5F4ED`, hairline right border, padding 20/12,
  sections 24 apart. Brand row: 28px clay mark (r8) + "JVL" serif 22/500 +
  the notifications bell (36px ghost). Group label "Área de trabalho" 12px.
  Items 40px, r8, 18px icons, `#3D3D3A`; hover sidebar-hover; active
  sidebar-active + Slate + 500 + `aria-current="page"`. Unread count = white
  pill with hairline on "Notificações". User card at the bottom: white, r12,
  hairline, 32px avatar, name + email, opens the account menu.
- **No top header on desktop.** Detail pages put a breadcrumb inside the
  page. Below 768px: a sticky 56px top bar (menu trigger, mark + "JVL",
  bell) and the sidebar as a sheet.
- **Page header:** optional 13px eyebrow (e.g. the date), serif `<h1>`,
  optional 15px subline, actions on the right (wrap below on narrow screens).

## Components

- `ui/` — Radix/shadcn primitives restyled on these tokens: `Button`
  (default / secondary / outline / ghost / destructive / link; sizes sm, md,
  lg, icon*), `Input`/`Textarea`/`Select` (white, `border-input`, r10, 16px
  text below `md` to stop iOS zoom), `Badge` (pill), `Tabs` (`line`
  underline variant with count chips), `Card` (r16), `Table`, `Avatar`,
  dialogs/sheets/menus/popovers/tooltips/toasts per the elevation rules.
- `shared/` — `PageContainer`, `PageHeader`, `PageBreadcrumb`, `SectionCard`,
  `KpiCard`, `TableCard`, `ListTabs`, `RankedBars`, `ColumnChart`,
  `InitialsAvatar`, `StatusBadge`, `TagChip`, `Pagination` (numbered + "A
  mostrar 1–10 de N" + optional page-size), `ClientTable`, `SearchField`,
  `SortableHead`, `EmptyState`, `CopyButton`, `AutocompleteInput`,
  `ConfirmDeleteDialog`.
- Unimplemented actions are hidden, not rendered as dead buttons.
