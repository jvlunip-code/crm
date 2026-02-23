# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack CRM application with a Django REST Framework backend and a React (Vite + TypeScript) frontend, orchestrated with Docker Compose. Requires Node.js 20.19+ or 22.12+.

## Development Commands

### Frontend (`crm-frontend/`)
```bash
npm install                # Install dependencies
npm run dev                # Start Vite dev server (localhost:5173)
npm run build              # Production build to dist/
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

## Architecture

### Stack
- **Frontend**: React 19, TypeScript (strict mode), Vite, TanStack Query, React Router, shadcn/ui (Radix), Tailwind CSS
- **Backend**: Django 5.1, Django REST Framework, PostgreSQL 16, session-based auth with CSRF
- **Infra**: Docker Compose with 4 services: PostgreSQL, Django backend, Vite frontend, Nginx reverse proxy

### Backend Structure (`crm-backend/`)
- `config/settings/` — Split settings: `base.py`, `development.py`, `production.py`. Controlled by `DJANGO_SETTINGS_MODULE` env var.
- `apps/authentication/` — Login/logout/me endpoints at `/api/auth/`
- `apps/customers/` — Customer CRUD at `/api/customers/`
- `apps/services/` — Customer services (nested under customers) at `/api/customers/{id}/services/`. Supports parent-child hierarchy (max 1 level).
- `apps/documents/` — Document upload/download at `/api/customers/{id}/documents/`. Video files blocked; 10MB default limit.
- DRF pagination: `PageNumberPagination` with `PAGE_SIZE=20`

### Frontend Structure (`crm-frontend/src/`)
- `lib/api-client.ts` — Central API client. Handles CSRF tokens, session auth credentials, and automatic snake_case↔camelCase key transformation between Django and React.
- `lib/mock-data.ts` — localStorage-based mock data layer for development without backend.
- `hooks/` — TanStack Query hooks wrapping API client calls (useQuery/useMutation).
- `components/ui/` — shadcn/ui library components.
- `components/layout/` — Header, Sidebar, Layout wrappers.
- `pages/` — Route-level page components (Dashboard, Customers, Services, Notifications, Events).
- `types/` — Shared TypeScript type definitions.
- Path alias: `@` maps to `src/` (configured in vite.config.ts and tsconfig).

### Request Flow
- **Local dev**: Vite proxies `/api/*` requests to `http://localhost:8000` (configurable via `VITE_API_PROXY_TARGET`)
- **Docker**: Nginx reverse proxy routes `/api/*` and `/admin/*` to Django, everything else to Vite

### Key Conventions
- Backend uses snake_case; frontend uses camelCase. The API client (`api-client.ts`) transforms keys automatically, but `CustomerService` fields (acesso, tarifario, operadora, etc.) use manual mapping due to domain-specific Portuguese field names.
- Services are nested REST resources: always accessed via `/api/customers/{customer_id}/services/`
- Frontend paginates through all DRF pages client-side (auto-fetches `next` URLs)
- TypeScript strict mode is enforced: `noUnusedLocals`, `noUnusedParameters`, `noUncheckedSideEffectImports`
