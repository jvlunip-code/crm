# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See also the root `../CLAUDE.md` for full-stack context including backend and Docker setup.

## Development Commands

```bash
npm install                          # Install dependencies
npm run dev                          # Vite dev server on localhost:5173
npm run build                        # TypeScript check + production build (tsc -b && vite build)
npm run lint                         # ESLint
npm run preview                      # Preview production build
npx shadcn@latest add <component>    # Add new shadcn/ui component
```

No test framework is currently configured.

## Architecture

React 19 + TypeScript 5.9 (strict) + Vite 7 + TanStack Query + React Router 7 + shadcn/ui (Radix) + Tailwind CSS 4.

### Path Alias

`@` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`). Always use `@/` imports.

### Routing (App.tsx)

- `/login` — public, `LoginPage`
- All other routes wrapped in `ProtectedRoute` (redirects to `/login` if unauthenticated) and `Layout` (sidebar + header):
  - `/` — `DashboardPage`
  - `/customers` — `CustomersPage`
  - `/customers/:id` — `CustomerDetailPage`
  - `/services` — `ServicesPage`
  - `/notifications` — `NotificationsPage`
  - `/events` — `EventsPage`

### Data Layer: Real API vs Mock Data

Two parallel data layers exist:

1. **Real API** (`lib/api-client.ts`) — Used for: customers, customer services, customer documents, authentication. Talks to Django backend via session cookies + CSRF.
2. **Mock data** (`lib/mock-data.ts`) — localStorage-based, used for: services catalog, notifications, events, customer notes, customer addresses. These features have no backend endpoints yet.

Hooks in `hooks/` abstract this — some call the real API, others call mock data. Check the hook implementation to know which layer you're working with.

### API Client (`lib/api-client.ts`)

- `fetchWithAuth()` — Core fetch wrapper. Attaches CSRF token (from `csrftoken` cookie) on mutating requests, sends `credentials: 'include'`, redirects to `/login` on 401.
- **Key transformation**: `toFrontend()` / `toBackend()` recursively transform snake_case↔camelCase for generic fields.
- **Exception — CustomerService fields**: Portuguese domain fields (`acesso`, `tarifario`, `operadora`, `valor`, `moeda`, `conta`, `cvp`, `data_fim`, `num_client`, `num_servico`, `observacoes`) use **manual mapping** in `transformCustomerService()` and explicit backend payloads in create/update. Do NOT rely on the generic `toBackend()` for CustomerService mutations.
- **Pagination**: `getAll()` and `getByCustomerId()` auto-follow DRF `next` URLs to fetch all pages client-side.
- **Service hierarchy**: Backend returns parent services with nested `children[]`. The client flattens them into a single array via `flattenServices()`.
- **Document upload**: Uses `FormData` directly (no JSON Content-Type header), bypasses `fetchWithAuth` for the upload request.

### API Groups

| Export | Endpoint pattern | Methods |
|---|---|---|
| `customersApi` | `/customers/` | CRUD |
| `customerServicesApi` | `/customers/{id}/services/` | CRUD (nested) |
| `customerDocumentsApi` | `/customers/{id}/documents/` | list, upload, delete, download URL |
| `authApi` | `/auth/` | login, logout, me |

### TanStack Query Conventions

- Default `staleTime`: 5 minutes, `refetchOnWindowFocus`: false (set in `main.tsx`)
- Query keys follow pattern: `['resource']` or `['resource', id]` (e.g., `['customers']`, `['customer-services', customerId]`)
- Mutations invalidate relevant query keys on success
- Conditional queries use `enabled` flag (e.g., `useCustomerServices` only fetches when `customerId` is truthy)

### UI Framework

- **UI primitives** in `components/ui/` — the phmcare web-app's radix-nova shadcn components (`radix-ui` monopackage), restyled on the design tokens. Port changes from the web-app instead of editing ad hoc; see `DESIGN.md`
- **Page molecules** in `components/shared/` — `PageHeader`, `TableToolbar`, `SearchField`, `Pagination`, `ClientTable`, `MetricCard`, `StatStrip`, `EmptyState`, `StatusBadge`, `SectionEyebrow`
- **Custom components**: `components/customer/` (customer detail tabs, dialogs, `DetailPanel`), `components/dashboard/` (charts, data table), `components/layout/` (sidebar, header, user menu, notifications bell)
- **Icons**: Lucide React (`lucide-react`)
- **Charts**: Recharts (`recharts`)
- **Toast notifications**: Sonner via `components/ui/sonner` — `<Toaster>` mounted in `App.tsx`; `<TooltipProvider>` is mounted in `main.tsx`
- **Tables**: TanStack Table for sortable/filterable data grids
- **Drag & drop**: dnd-kit for the dashboard table row reordering

### Styling

- **Design system: `DESIGN.md`** — a clone of the phmcare web-app system. Tokens in `src/index.css` (hex values, three layers), Inter Variable + Geist Mono Variable, `type-*` text utilities, 2px/4px radii
- Tailwind CSS 4 via `@tailwindcss/vite` (no `tailwind.config.js`); `tw-animate-css` + `shadcn/tailwind.css`
- Light only: dark mode is not supported, don't add `dark:` utilities
- Status colour comes from a tone (`StatusBadge` + `lib/status.ts`), never raw Tailwind palette classes
- `cn()` utility from `lib/utils.ts` (clsx + tailwind-merge) for conditional classes

### Locale

UI text, date formatting, and status labels are in **Portuguese (pt-PT)**. Formatting utilities in `lib/utils.ts`:
- `formatDate()` / `formatDateTime()` — Portuguese locale
- `formatRelativeTime()` — "Agora mesmo", "Há 5m", "Há 2h", etc.
- `formatCurrency()` — EUR formatting
- Status labels: active→Ativo, inactive→Inativo, read→Lido, unread→Não lido

### Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `/api` | API base URL for production builds |
| `VITE_API_PROXY_TARGET` | `http://localhost:8000` | Vite dev proxy target |
