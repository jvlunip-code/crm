# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See also the root `../CLAUDE.md` for full-stack context including backend and Docker setup.

`npm run build` (`tsc -b && vite build`) is the real type check. No test framework is currently configured.

## Architecture

### Path Alias

`@` maps to `src/`. Always use `@/` imports (never relative `../` paths).

### Data Layer: Real API vs Mock Data

Two parallel data layers exist:

1. **Real API** (`lib/api-client.ts`) — Used for: customers (incl. `suggest` and the address singleton), customer services, customer documents, the cross-customer services list (`/services` page), notifications, dashboard summary, authentication. Talks to Django backend via session cookies + CSRF.
2. **Mock data** (`lib/mock-data.ts`) — localStorage-based, used for: events, customer notes. These features have no backend endpoints yet, so their screens carry a "Dados de demonstração" pill.

Hooks in `hooks/` abstract this — some call the real API, others call mock data. Check the hook implementation to know which layer you're working with.

### API Client (`lib/api-client.ts`)

- `fetchWithAuth()` — Core fetch wrapper. Attaches CSRF token (from `csrftoken` cookie) on mutating requests, sends `credentials: 'include'`, redirects to `/login` on 401.
- **Key transformation**: `toFrontend()` / `toBackend()` recursively transform snake_case↔camelCase for generic fields.
- **Exception — CustomerService fields**: Portuguese domain fields (`acesso`, `tarifario`, `operadora`, `valor`, `moeda`, `conta`, `cvp`, `data_fim`, `num_client`, `num_servico`, `observacoes`, `morada`) use **manual mapping** in `transformCustomerService()` and explicit backend payloads in create/update. Do NOT rely on the generic `toBackend()` for CustomerService mutations.
- **Pagination**: `getAll()` and `getByCustomerId()` auto-follow DRF `next` URLs to fetch all pages client-side.
- **Service hierarchy**: Backend returns parent services with nested `children[]`. The client flattens them into a single array via `flattenServices()`.
- **Document upload**: Uses `FormData` directly (no JSON Content-Type header), bypasses `fetchWithAuth` for the upload request.

- **List screens** use server-side pages (`customersApi.getPage`).

### Dashboard (`pages/DashboardPage.tsx`)
- All real data, no demo parts. Cards live in `components/dashboard/`: `DashboardKpis`, `EndingByMonthCard` (`ColumnChart` of `endingByMonth`) and `OperatorsCard` (`RankedBars` of `topOperators`) read `useDashboardSummary()` (`/api/dashboard/summary/`); `EndingSoonTable` reads `useServicesPage({ ending: '90', ordering: 'data_fim' })`; `UnreadNotificationsCard` and the unread KPI use the notifications hooks (`useUnreadCount()`), so notification mutations refresh them.
- Mutations that change the summary (customers, services) also invalidate `['dashboard-summary']`; the Customers and Services list headers/tab counts read it too.
- Deep links: `/services?ending=90|180|270|expired`, `/customers?estado=ativos|inativos`, `/notifications?estado=por-ler|lidas` — list tabs are URL-synced (`replace`).
- Imported customers' `created_at` is the import date, so "new customers over time" charts are meaningless for legacy data (and "Cliente desde" is hidden).

### TanStack Query Conventions

- Default `staleTime`: 5 minutes, `refetchOnWindowFocus`: false (set in `main.tsx`)
- Query keys follow pattern: `['resource']` or `['resource', id]` (e.g., `['customers']`, `['customer-services', customerId]`)
- Mutations invalidate relevant query keys on success
- Conditional queries use `enabled` flag (e.g., `useCustomerServices` only fetches when `customerId` is truthy)

### UI Framework

- **UI primitives** in `components/ui/` — radix-nova shadcn components (`radix-ui` monopackage) restyled on the Hearth tokens. **Owned locally**: edit them here (the old phmcare coupling is dropped); see `DESIGN.md`
- **Page molecules** in `components/shared/` — `PageContainer`, `PageHeader`, `PageBreadcrumb`, `SectionCard`, `KpiCard`, `TableCard`, `ListTabs`, `RankedBars`, `ColumnChart`, `InitialsAvatar`, `StatusBadge`, `TagChip`, `Pagination`, `ClientTable`, `SearchField`, `SortableHead`, `EmptyState`, `CopyButton`, `AutocompleteInput`, `ConfirmDeleteDialog`
- **Custom components**: `components/customer/` (profile card, KPI row, side cards + `DetailList`, Serviços/Documentos/Notas tabs, dialogs), `components/dashboard/` (dashboard cards + `format.ts`), `components/layout/` (sidebar, mobile top bar, user card, notifications bell; no desktop header)
- **Icons**: Lucide React (`lucide-react`)
- **Charts**: plain CSS/HTML (`shared/ColumnChart`, `shared/RankedBars`) with printed values and an sr-only table; no chart library
- **Toast notifications**: Sonner via `components/ui/sonner` — `<Toaster>` mounted in `App.tsx`; `<TooltipProvider>` is mounted in `main.tsx`
- **Tables**: TanStack Table for sortable/filterable data grids

### Styling

- **Design system: `DESIGN.md`** ("Hearth", 2026-11) — rules; values and contrast in `docs/design/2026-11-hearth/tokens.json`, decisions and component map in `docs/design/2026-11-hearth/PLAN.md`. Tokens in `src/index.css`; Public Sans Variable (UI) + Source Serif 4 Variable (titles, big numbers) + Geist Mono Variable (codes only: NIF, IBAN, acesso, Nº serviço); `type-*` text utilities, no arbitrary `text-[…]`; radii 4/8/10/12/16 (cards `rounded-xl`); 0.5px hairlines via `--default-border-width`; focus = 2px blue outline
- Tailwind CSS 4 via `@tailwindcss/vite` (no `tailwind.config.js`); `tw-animate-css` + `shadcn/tailwind.css`
- Light only (`color-scheme: light`): dark mode is not supported, don't add `dark:` utilities
- Status colour comes from a tone (`StatusBadge` + `lib/status.ts`), never raw Tailwind palette classes
- `cn()` utility from `lib/utils.ts` (clsx + tailwind-merge) for conditional classes

### Locale

UI text, date formatting, and status labels are in **Portuguese (pt-PT)**. Formatting utilities in `lib/utils.ts`:
- `formatDate()` / `formatDateTime()` — Portuguese locale
- `formatRelativeTime()` — "Agora mesmo", "Há 5m", "Há 2h", etc.
- `formatCurrency()` — EUR formatting ("128,40 €"); `formatCount()` (pt-PT grouping), `formatDayMonthYear()` ("28 nov. 2026"), `formatServiceDate()` ("28/11/2026"), `formatFileSize()`
- Status labels: active→Ativo, inactive→Inativo, read→Lido, unread→Não lido

### Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `/api` | API base URL for production builds |
| `VITE_API_PROXY_TARGET` | `http://localhost:8000` | Vite dev proxy target |
