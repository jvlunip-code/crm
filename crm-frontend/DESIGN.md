# Design

Visual system as implemented (`src/index.css` + `src/components/ui/*` +
`src/components/shared/*`). It is a clone of the **phmcare web-app** design
system (`~/src/phmcare-ai/web-app`, its `DESIGN.md`); keep the two in step
rather than diverging here. Register: product (see `../PRODUCT.md`).

## Token layers

`src/index.css` has three layers; components only ever use the middle one.

1. **Source primitives** `--lf-*` — the raw palette. Never referenced from
   components.
2. **Semantics** — shadcn's variable names are kept so `ui/*` compiles, plus
   `--foreground-secondary`, `--foreground-disabled`, `--link`,
   `--border-subtle`, `--border-strong`, `--border-dashed`, `--primary-hover`,
   `--selection`, `--highlight`, `--accent-cta`,
   `--status-{neutral,info,success,warning,error,note}`, `--chart-1..5`.
   Exposed to Tailwind through `@theme inline` (`bg-sidebar`, `text-link`,
   `border-status-warning/50`…).
3. **Component decisions** — cva variants inside the component files.

## Surfaces and colour

Warm neutrals; separation by 1px borders, not shadows.

| Role                                 | Utility                | Value     |
| ------------------------------------ | ---------------------- | --------- |
| canvas (content)                     | `bg-background`        | `#F6F6F3` |
| navigation, table headers            | `bg-sidebar`           | `#EDEDE8` |
| recessed (tabs track, kbd, skeleton) | `bg-muted`             | `#E5E5E1` |
| panel (cards, dialogs, table bodies) | `bg-card`              | `#FFFFFF` |
| hover row / item                     | `bg-accent`            | `#EDEDE8` |
| selected / unread row                | `bg-selection`         | violet 8% |
| structural border                    | `border-border`        | `#CFCFC9` |
| inner rule                           | `border-border-subtle` | `#E5E5E1` |
| strong border (hover/outline)        | `border-border-strong` | `#404039` |
| dashed rule, drop zone               | `border-border-dashed` | `#BEBEB6` |

Text: `text-foreground` `#222220` · `text-foreground-secondary` `#3D3D38` ·
`text-muted-foreground` `#6B6B66` · `text-link` / focus ring `#4F39F6`.

Actions: primary is the dark fill (`bg-primary`); secondary is
`variant="outline"`; `destructive` is an outlined red, never a red fill.
`variant="accent"` (`#FBFF81`) is reserved — at most one per screen, only by
product decision. Focus: 2px violet ring, 2px offset, everywhere.

**Status** is rendered by `shared/StatusBadge` only: the hue lives on the
border, a 10% tint and a dot; the label stays primary text. Domain maps pick a
tone, never a colour:

- `lib/status.ts` — `getStatusTone()` beside `getStatusLabel()`
  (active→success, inactive/read→neutral, unread/pending→info,
  paused→warning, cancelled→error).
- `lib/notifications/flag-style.ts` — service end-date flags
  (`FLAG[flag]` → label, tone, left-rule class).
- `pages/EventsPage.tsx` — event actions.

**Chart series** (`--chart-1..5`: violet, teal, green, amber, pink) are
distinct from status colours. Grid = `border`, axis text muted, area fill
12%, stroke 1.5px, no gradients, tooltip on hover only.

**Dark mode is not supported.** `.dark` holds the source's declared values
only; there is no toggle. Do not add `dark:` utilities in feature code.

## Typography

Inter Variable for everything, Geist Mono Variable for codes, ids, NIF/IBAN,
phone numbers, dates in rows and amounts. `--font-heading` keeps F37 Analog
first in the stack (not licensed) and renders as Inter 500.

Use the `type-*` utilities for running text:

| Utility           | Size / line | Weight | Use                                 |
| ----------------- | ----------- | ------ | ----------------------------------- |
| `type-page-title` | 21 / 28     | 500    | the page `<h1>` (`PageHeader`)      |
| `type-metric`     | 24 / 28     | 500    | KPI values, tabular                 |
| `type-section`    | 14 / 20     | 500    | card / panel titles                 |
| `type-body`       | 14 / 20     | 430    | descriptions, dialogs, empty states |
| `type-dense`      | 13 / 18     | 430    | table cells, list rows, dl values   |
| `type-nav`        | 13 / 16     | 430    | sidebar, breadcrumb, tabs           |
| `type-label`      | 13 / 16     | 500    | form labels                         |
| `type-control`    | 13 / 18     | 450    | buttons, chips                      |
| `type-caption`    | 12 / 16     | 400    | meta, helper, footers               |
| `type-eyebrow`    | 11 / 16     | 500    | uppercase group labels, dl terms    |
| `type-mono`       | 13 / 20     | 400    | codes, ids, € (tabular)             |
| `type-kbd`        | 11 / 16     | 500    | keyboard keys, short codes          |

No arbitrary `text-[…]` sizes in feature code; nothing below 11px.

## Spacing, radii, elevation, motion

- 4px grid. Page gutter `px-4 lg:px-6`, page vertical `py-4`, card padding
  16, table cells `px-3 py-2.5`, controls 24 / 28 / 32 / 36
  (`xs` / `sm` / default / `lg`).
- Radii: `rounded-xs` 1px, `rounded-sm` 2px (controls, chips, cards),
  `rounded-lg` 4px (menus, dialogs); `rounded-full` only for avatars and
  dots. Everything past 4px is collapsed in `@theme`.
- Elevation: cards/tables/sidebar none; `shadow-1` menus, popovers, sheet;
  `shadow-2` dialogs.
- Motion: 150ms standard easing for colour/border; overlays fade + 4px
  slide; no entrance animations. `prefers-reduced-motion` zeroes transitions
  except `animate-spin`.
- Decoration: `CornerMarkers` only on the login card and framed page-level
  empty states.

## Components

- `components/ui/` — the web-app's radix-nova primitives (`radix-ui`
  monopackage), restyled on the tokens. Port changes from the web-app rather
  than editing locally; CRM-only primitives (`calendar`, `date-picker`,
  `phone-input`, `file-drop-zone`) follow the same rules.
- `components/shared/` — page molecules: `PageHeader` (the single `<h1>`,
  mono identifier, badges, actions), `SearchField`, `TableToolbar`,
  `Pagination` (offset), `ClientTable` (client-side TanStack table + empty
  state + pagination), `MetricCard`, `StatStrip`, `EmptyState`
  (+`CornerMarkers`), `StatusBadge`, `SectionEyebrow`.
- `components/customer/DetailPanel` — titled panel with flush content and
  `DetailRow` (eyebrow term, dense value) for the customer detail tabs.
- Forms use `Field` / `FieldLabel` (`required` marks the label) /
  `FieldDescription` / `FieldError` with 32px controls. Side panels are
  `Sheet`; floating non-menu panels (notifications) are `Popover`; action
  menus are `DropdownMenu`. Icons: lucide, 16px in controls.
- Unimplemented actions are hidden, not rendered as buttons that do nothing.
  Sample data is labelled with a warning `StatusBadge` "Dados de
  demonstração".

Shell (`components/layout/`): 192px flat sidebar on the navigation surface,
65px header with the breadcrumb trail (`lib/breadcrumbs.ts`) and the
notifications bell, fluid canvas. The sidebar collapses to a sheet below
768px.
