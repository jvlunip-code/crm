# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack CRM application with a Django REST Framework backend and a React (Vite + TypeScript) frontend, orchestrated with Docker Compose. UI text is in **Portuguese (pt-PT)**.

## Development Commands

### Frontend (`crm-frontend/`)
```bash
npm install                # Install dependencies
npm run dev                # Start Vite dev server (localhost:5173)
npm run build              # TypeScript check + production build (tsc -b && vite build)
npm run lint               # ESLint (TypeScript + React)
npx shadcn@latest add <component>  # Add shadcn/ui components
```

### Backend (`crm-backend/`)
```bash
python manage.py runserver           # Dev server (port 8000)
python manage.py migrate             # Apply migrations
python manage.py makemigrations      # Generate migrations after model changes
python manage.py createsuperuser     # Create admin user
```

### Docker (full stack)
```bash
docker-compose up          # Start all services (PostgreSQL, backend, frontend, nginx)
docker-compose down        # Stop all services
```

### Deployment (production VM via SSH)
```bash
scripts/deploy-backend.sh   # Git pull, pip install, migrate, collect static, reload uWSGI
scripts/deploy-frontend.sh  # Git pull, npm ci, build (static files, no restart needed)
scripts/setup-vm.sh          # One-time VM provisioning (Python 3.13, Node 22, PostgreSQL 16, Nginx, uWSGI, systemd)
```

### Testing
No test framework is configured for either frontend or backend.

## Architecture

### Stack
- **Frontend**: React 19, TypeScript 5.9 (strict mode), Vite 7, TanStack Query 5, React Router 7, shadcn/ui (Radix), Tailwind CSS 4, Recharts, TanStack Table
- **Backend**: Django 5.1, Django REST Framework, PostgreSQL 16, session-based auth with CSRF, uWSGI
- **Infra**: Docker Compose (dev), DigitalOcean VM with Nginx + uWSGI + systemd (prod)
- **Runtimes**: Python 3.13 (`.python-version`), Node 22.17 (`.nvmrc`)

### Backend Structure (`crm-backend/`)
- `config/settings/` — Split settings: `base.py`, `development.py`, `production.py`. Controlled by `DJANGO_SETTINGS_MODULE` env var. Dev defaults to `AllowAny` permissions; prod requires `IsAuthenticated`.
- `apps/authentication/` — Login/logout/me endpoints at `/api/auth/`
- `apps/customers/` — Customer CRUD at `/api/customers/` (ModelViewSet)
- `apps/services/` — Customer services (nested under customers) at `/api/customers/{id}/services/`. Supports parent-child hierarchy (max 1 level, validated in model `clean()`).
- `apps/documents/` — Document upload/download at `/api/customers/{id}/documents/`. Video files blocked; 10MB default limit (`DOCUMENT_MAX_FILE_SIZE`). Custom ViewSet (not ModelViewSet) with `@action` for download.
- `specs/` — API specification documents (Portuguese)
- DRF pagination: `PageNumberPagination` with `PAGE_SIZE=20`

### Frontend Structure (`crm-frontend/src/`)
- `lib/api-client.ts` — Central API client. Handles CSRF tokens, session auth credentials, and automatic snake_case↔camelCase key transformation between Django and React.
- `lib/mock-data.ts` — localStorage-based mock data layer for features without backend endpoints yet (services catalog, notifications, events, customer notes, customer addresses).
- `hooks/` — TanStack Query hooks wrapping API client calls (useQuery/useMutation). Check each hook to determine if it uses real API or mock data.
- `components/ui/` — shadcn/ui library components (do not edit directly).
- `components/customer/` — Customer detail view components (tabs, dialogs, forms).
- `components/layout/` — Header, Sidebar, Layout, ProtectedRoute wrappers.
- `pages/` — Route-level page components (Dashboard, Customers, CustomerDetail, Services, Notifications, Events, Login).
- `types/` — Shared TypeScript type definitions.
- `lib/utils.ts` — Formatting utilities (`formatDate`, `formatCurrency`, `formatRelativeTime`) using Portuguese locale, status label mappings, `cn()` helper.
- Path alias: `@` maps to `src/` (configured in vite.config.ts and tsconfig). Always use `@/` imports.

### Request Flow
- **Local dev**: Vite proxies `/api/*` requests to `http://localhost:8000` (configurable via `VITE_API_PROXY_TARGET`)
- **Docker**: Nginx reverse proxy routes `/api/*` and `/admin/*` to Django, everything else to Vite
- **Production**: Nginx routes `/api/*` and `/admin/*` to uWSGI via Unix socket, serves frontend dist/ as static files with SPA fallback

### Key Conventions
- Backend uses snake_case; frontend uses camelCase. The API client (`api-client.ts`) transforms keys automatically, but `CustomerService` fields (acesso, tarifario, operadora, etc.) use **manual mapping** in `transformCustomerService()` due to domain-specific Portuguese field names. Do NOT rely on the generic `toBackend()` for CustomerService mutations.
- Services and documents are nested REST resources: always accessed via `/api/customers/{customer_id}/services/` and `/api/customers/{customer_id}/documents/`
- Frontend paginates through all DRF pages client-side (auto-fetches `next` URLs)
- TypeScript strict mode is enforced: `noUnusedLocals`, `noUnusedParameters`, `noUncheckedSideEffectImports`
- TanStack Query defaults: `staleTime` 5 minutes, `refetchOnWindowFocus` false. Query keys follow `['resource']` or `['resource', id]` pattern.
- Document upload uses `FormData` directly (no JSON Content-Type), bypasses the standard `fetchWithAuth` wrapper.
- Backend returns parent services with nested `children[]`; the client flattens them via `flattenServices()`.
