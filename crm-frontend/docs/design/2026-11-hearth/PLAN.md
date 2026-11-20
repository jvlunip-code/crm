# Hearth refresh: migration plan

Goal: restyle the whole CRM to the Hearth design canvas
(https://claude.ai/artifact/DKkJH5xDZfE47htp2uSmyC: Dashboard, Users list,
User details), keeping every working feature and showing only real data.

Inputs: `tokens.json` (values plus contrast), `../../../DESIGN.md` (rules),
and the analysis reports (token extraction, component inventory, screen
mapping, completeness critique) produced on 2026-11-20.

## Decisions

These were taken by default so the work could ship. Each one can be swapped
by changing a single token or file.

| # | Question | Decision | Swap cost |
| --- | --- | --- | --- |
| 1 | Sans face | Public Sans Variable (OFL, self-hosted) | `--font-sans` |
| 2 | Serif face | Source Serif 4 Variable (OFL, opsz) | `--font-heading` |
| 3 | Accent | Clay `#D97757` (template default) | `--brand` / `--brand-strong` / `--chart-1` |
| 4 | Wordmark | "JVL" in serif, with a clay mark and an ivory dot (not the spark) | `AppSidebar` |
| 5 | Field and checkbox boundary | `#87867F` instead of the template's rgba .3 (WCAG 1.4.11) | `--input` |
| 6 | Hairline | 0.5px via `--default-border-width` | one token |
| 7 | Warning tone | Clay, matching the template and the flag name `orange` | status tokens |
| 8 | Density | 40px controls; 44 for toolbars; 32 `sm` in dialogs and tables; 12px cells | button/input cva |
| 9 | Unread rows | weight 500 + 6px dot + sr-only "por ler"; no tint | Notifications |
| 10 | Shell | no desktop header. Bell in the sidebar brand row. Breadcrumbs only on detail pages. 56px mobile top bar | layout/* |
| 11 | Mono | codes only (NIF, IBAN, acesso, Nº serviço); dates, € and phones in tabular sans | call sites |
| 12 | Dark mode | removed; `color-scheme: light` | — |
| 13 | `valor` | treated as monthly: "€X/mês" | copy |
| 14 | Customer services table | keeps all columns, scrolling sideways (no information moved) | CustomerServicesTab |
| 15 | Eventos (mock data) | stays in the nav with a "Dados de demonstração" pill | AppSidebar |
| 16 | Notificações default tab | "Todas" (unchanged behaviour), tabs Todas / Por ler / Lidas | NotificationsPage |
| 17 | "Cliente desde" | hidden, because imported customers carry the import date; the KPI slot shows "Documentos" | detail KPIs |
| 18 | Dashboard deltas | none; detail lines are honest snapshot breakdowns | — |

## Component map

The existing shadcn primitives stay as the styled base. The new shared pieces
are thin compositions on top of them.

| New / changed | Replaces | Notes |
| --- | --- | --- |
| `shared/PageContainer` | ad-hoc `px-4 py-4 lg:px-6` | responsive padding, 1200px column, gap 24 |
| `shared/PageHeader` (rewrite) | old PageHeader (border-b, mono identifier) | eyebrow, serif h1, lead, actions |
| `shared/PageBreadcrumb` | `SiteHeader` breadcrumbs + `lib/breadcrumbs.ts` | detail pages only; real names |
| `shared/SectionCard` | `Card` usages, `customer/DetailPanel` | r16, padding 24, serif title, action slot, `flush` for tables |
| `shared/KpiCard` | `MetricCard`, `StatStrip`, `dashboard/SectionCards` | `size` lg (34) / md (28); optional link |
| `shared/TableCard` | ClientTable wrappers | card + overflow-x + footer slot |
| `shared/ListTabs` | ToggleGroup filters, status Selects | Radix Tabs `line`, count chips, URL-synced |
| `shared/RankedBars` | — | dashboard "Operadoras" |
| `shared/ColumnChart` | `dashboard/ChartAreaInteractive` (random data) | CSS bars, values printed, sr-only table |
| `shared/InitialsAvatar` | ad-hoc avatars | 24/32/36/72, `id % 4` fill |
| `shared/Pagination` (extend) | prev/next only | numbered, "A mostrar 1–10 de N", optional page size |
| `shared/StatusBadge`, `ui/badge` | border-hue badges | tinted pill + ink + dot |
| `shared/TagChip` | — | `#F0EEE6` chip + 8px tag dot |
| `layout/MobileTopBar` | `SiteHeader` on mobile | sticky 56px |
| removed | `SiteHeader`, `lib/breadcrumbs.ts`, `dashboard/DataTable` (demo), `ChartAreaInteractive`, `SectionEyebrow`, `StatStrip`, `MetricCard`, `CornerMarkers` | also drop `@dnd-kit/*`; `recharts` and `ui/chart.tsx` too, if nothing else imports them |

## Phases

Each phase builds (`npm run build`) and lints with no new problems before the
next one starts. Everything lands on `feat/crm-improvements`, then goes
through a PR and a squash-merge to `main`, then deploy (backend first).

### P0: Tokens and docs
- `src/index.css`:
  - Replace the `--lf-*` primitives with the warm scale and brand primitives.
  - Re-point layer 2 to the values in `tokens.json`, adding:
    - text: `--foreground-tertiary`, `--link-hover`
    - surfaces and brand: `--surface-sunken`, `--brand`, `--brand-strong`, `--overlay`
    - status: `--status-*-bg` / `--status-*-fg`
    - avatars and sidebar: `--avatar-1..4`, `--sidebar-hover`
  - Radii 4/8/10/12/16.
  - `--default-border-width: 0.5px`.
  - The new type ramp.
  - Shadows.
  - Focus outline recipe.
  - `color-scheme: light`.
  - Delete `.dark`, drop `--accent-cta`, drop `cv11`/`ss01`.
- Fonts: add `@fontsource-variable/public-sans` and `@fontsource-variable/source-serif-4`, drop `@fontsource-variable/inter`.
- `index.html`: `<meta name="theme-color" content="#FAF9F5">`, title "JVL CRM".
- Docs:
  - `DESIGN.md` (done).
  - `crm-frontend/CLAUDE.md` design and dashboard lines.
  - `PRODUCT.md` anti-references: allow the Ivory canvas; keep "no uppercase eyebrows".
- `.impeccable/config.json`: ignore `cream-palette` (Ivory is the chosen canvas).

### P1: Primitives (`ui/*`)
Rework these on the tokens:
- button, input, textarea, select, checkbox, switch, badge, tabs (line variant + count), card, table, avatar
- dialog, alert-dialog, sheet, dropdown-menu, popover, tooltip, sonner
- skeleton, progress, calendar/date-picker, file-drop-zone, phone-input, kbd, toggle-group, sidebar

Replace box-shadow focus rings with the outline recipe.

### P2: Shared molecules and shell
- Build the component map above.
- Shell:
  - sidebar at 232px
  - brand row with the bell
  - group label
  - nav including Eventos, with an unread pill on Notificações
  - user card
  - mobile top bar
  - desktop sidebar always open
- Delete `SiteHeader` and `lib/breadcrumbs.ts`.

### P3: Dashboard
All data is real, from `/api/dashboard/summary/`, the notifications API and
the services API.
- Header: Lisbon date eyebrow, then "Bom dia / Boa tarde / Boa noite, {nome}". Actions: "Ver serviços a terminar" and "Novo cliente".
- KPI cards:
  - Clientes (ativos · inativos)
  - Serviços ativos (€/mês · de total)
  - A terminar em 90 dias (terminados · até 180)
  - Notificações por ler
- Row 1:
  - "Serviços a terminar" `ColumnChart` (12 months)
  - "Operadoras" `RankedBars`, with a footer labelled "Outras / sem operadora"
- Row 2:
  - "Próximos a terminar" table (6 rows, `?ending=90&ordering=data_fim`)
  - "Notificações por ler" list (5 rows, mark-as-read button)
- Remove the demo components.

### P4: List pages
- **Customers:**
  - `ListTabs` Todos / Ativos / Inativos (counts from the summary; new backend `?status=` filter plus a test and a spec update)
  - 44px search, tag filter button
  - table: avatar + name + email, company + NIF, phone, tags, status pill, ⋯
  - numbered pagination inside the card
- **Services:** `ListTabs` Todos / ≤90 / ≤180 / ≤270 / Terminados, URL-synced `?ending=` (dashboard links target it); table and pagination as above.
- **Notifications:**
  - tabs Todas / Por ler / Lidas
  - search
  - table: Estado pill / Serviço / Termina / Criada / ⋯
  - unread dot
  - page-size select kept
- **Events:** same list anatomy, plus the demo pill.

### P5: Customer detail
- Breadcrumb "← Clientes / {nome}".
- Profile card:
  - 72px avatar
  - serif h1 + status pill
  - company · NIF line
  - actions: Email, Ligar, Editar (icon), "Novo serviço" (primary; lift the service dialog)
- KPI row, computed from active services only (this fixes today's sums):
  - Valor mensal
  - Serviços ativos (· de total)
  - Próximo fim (+ urgency pill)
  - Documentos
- Main column card with 48px tabs: Serviços / Documentos / Notas.
- Side cards: Contacto, Morada, Empresa, Etiquetas. Inline edit and copy buttons are kept.

### P6: Login, loading and polish
- Login: Ivory page, brand row, white r16 card, serif "Iniciar sessão", 44px fields, full-width primary button.
- ProtectedRoute loading screen.
- Contrast pass, reduced motion, coarse-pointer hit areas.
- Then build, lint and the screenshot checklist.

## Risks and checks
- Token swaps restyle every screen at once. Re-choose each `rounded-*` per component; a plain value swap would make cards 8px.
- Default control height grows from 32 to 40. Use `sm` (32) inside dialogs and tables to keep them dense.
- Unverified rendering of 0.5px dashed borders on Windows at 125% scaling and in Firefox: check after deploy.
- The customer detail rebuild is the riskiest phase: inline editing, the tags picker, the address and service dialogs, and table width.
- Screenshot checklist at 390 and 1440px:
  - every route
  - one dialog, one menu, one toast
  - the mobile sheet
  - keyboard focus on the sidebar, tabs and table actions
