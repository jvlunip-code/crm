# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Internal CRM for JVL Comunicações (Portuguese telecom/utilities back-office): customers, their services/contracts, documents, and service-ending notifications. Django REST Framework backend + React (Vite + TypeScript) frontend in one repo (`github.com/jvlunip-code/crm`). UI text is **Portuguese (pt-PT)**. Product intent and design principles: `PRODUCT.md`; visual system: `crm-frontend/DESIGN.md`; frontend specifics: `crm-frontend/CLAUDE.md`.

```
crm-backend/    Django 5.x + DRF API (Python 3.13)
crm-frontend/   React 19 + Vite 7 SPA (Node 22)
scripts/        SSH deploy scripts + prod config templates (nginx, uWSGI, systemd, env)
nginx/          nginx.conf for the Docker Compose stack only
docs/           ADRs + production HTTPS setup
migration/      Legacy MySQL dump (CSV + ~2 GB documents) — gitignored, local only
```

## Running Locally (recommended: native backend + frontend, Postgres in Docker)

```bash
# 1. Database (Postgres 16; user/pass/db = crm/crm_password/crm, port 5432)
docker compose up -d database

# 2. Backend — http://localhost:8000
cd crm-backend
uv venv && uv pip install -r requirements.txt   # or: python3.13 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py createsuperuser        # needed: the SPA requires a session login
.venv/bin/python manage.py runserver

# 3. Frontend — http://localhost:5173 (Vite proxies /api → :8000)
cd crm-frontend
nvm use            # .nvmrc = 22.17.0; Vite 7 needs Node ≥ 20.19
npm install
npm run dev
```

- `manage.py` defaults to `config.settings.development` and DB defaults match the Docker DB, so **no env vars are needed locally**. `crm-backend/.env` exists but is empty and is **not loaded** (python-dotenv is installed but unused) — export variables in the shell instead.
- Dev uploads go to `/tmp/crm-uploads/` (`MEDIA_ROOT`).
- Migrations create the `unaccent` and `pg_trgm` extensions; the DB user must be allowed to `CREATE EXTENSION` (the Docker `crm` user is superuser).
- **Realistic data**: with the legacy dump in `migration/` (`jvl_db.csv` + `documentos/`), run `python manage.py import_legacy` (`--dry-run`, `--limit N`, `--update-existing`). This is how prod was backfilled (~530 customers, ~2.2k services, ~1.5k docs). A fresh DB otherwise has no customers.
- Full stack alternative: `docker compose up` (database, backend on :8000, Vite, nginx on :80 → open http://localhost). Note the frontend image uses Node 20 and the backend image Python 3.12, unlike the native/prod runtimes.

### Commands

```bash
# Backend (crm-backend/)
python manage.py test                       # Django test runner — customer search + dashboard summary; needs Postgres
python manage.py makemigrations / migrate
python manage.py generate_service_ending_notifications   # what the prod daily timer runs
python manage.py import_legacy [--dry-run]

# Frontend (crm-frontend/)
npm run build      # tsc -b && vite build — the real type check
npm run lint       # ESLint (currently 2 errors / 4 warnings on main)
npm run format     # Prettier
npx shadcn@latest add <component>
```

No frontend test framework. No CI — nothing runs on push; build/lint/test locally before merging.

## Architecture

### Backend (`crm-backend/`)
- `config/settings/` — `base.py` (prod-safe defaults, `IsAuthenticated`), `development.py` (`DEBUG`, **`AllowAny`**, localhost CORS/CSRF), `production.py` (env-driven hosts/CORS/CSRF, HTTPS-only cookies, HSTS, `SECURE_SSL_REDIRECT`, error log to `/var/log/uwsgi/crm-django-errors.log`). Selected by `DJANGO_SETTINGS_MODULE`.
- Auth: Django session + CSRF (`SessionAuthentication`). Default DRF page size 20.
- Dependencies: `requirements.txt` is what deploys use. `pyproject.toml`/`uv.lock` lag behind (missing `pydantic`) — keep `requirements.txt` authoritative.

| App | Endpoints | Notes |
|---|---|---|
| `authentication` | `/api/auth/login/`, `logout/`, `me/` | |
| `customers` | `/api/customers/` (ModelViewSet), `/api/customers/suggest/?q=`, `/api/customers/{id}/address/` (singleton, PUT upserts) | Own pagination: 10/page, `?page_size=` up to 100, `?ordering=`. `?search=` uses `Customer.objects.search()`: Postgres full-text prefix match on generated `search_vector` columns (accent-insensitive via `immutable_unaccent`), numeric NIF/phone matching, trigram fallback for typos (`fuzzy` flag). Also `CustomerContact` and `LegacyImportMap` models (legacy import). |
| `services` | `/api/customers/{id}/services/` | Parent/child hierarchy (max 1 level, validated in `clean()`); responses nest `children[]`. |
| `documents` | `/api/customers/{id}/documents/[{pk}/[download/]]` | Custom ViewSet. Videos blocked; max `DOCUMENT_MAX_FILE_SIZE` (default **25 MB**); images >2 MB and PDFs compressed on upload (`file_compression.py`, Pillow/pikepdf). |
| `dashboard` | `/api/dashboard/summary/` | Aggregates in `summary.py`: customers, services (active = no `data_fim` or `data_fim` ≥ today, Lisbon date; sub-services counted), ending buckets reusing the notification windows (expired/≤90/≤180/≤270 days), next-12-months `ending_by_month`, top operators, unread notifications. `within_90`-style keys are mapped by hand in `dashboardApi` (generic camelCase transform skips digits). |
| `notifications` | `/api/notifications/` + `mark_read`, `mark_unread`, `mark_all_read`, `dismiss`, `generate_service_ending` | `SERVICO_A_TERMINAR` rows generated by a use case (`use_cases/generate_service_ending.py`, pydantic schemas), deduped by `dedup_key`. Run daily in prod by a systemd timer. |

API specs (Portuguese): `crm-backend/specs/` (copies in `crm-frontend/docs/`) — older than the code; trust the serializers.

### Frontend (`crm-frontend/src/`)
- `lib/api-client.ts` — central client: CSRF header from `csrftoken` cookie, `credentials: 'include'`, redirect to `/login` on 401, recursive snake_case↔camelCase (`toFrontend`/`toBackend`).
- **Real API**: auth, customers (+ address, suggest), customer services, documents, notifications.
- **Mock (`lib/mock-data.ts`, localStorage)**: services catalog (`/services` page), events, customer notes. No backend for these yet.
- `hooks/` — TanStack Query wrappers; the import (`api-client` vs `mock-data`) tells you which layer a hook uses.
- `pages/` (Dashboard, Customers, CustomerDetail, Services, Notifications, Events, Login), `components/{ui,shared,customer,dashboard,layout}/`, `types/index.ts`, `lib/utils.ts` (pt-PT formatters, `cn()`), `lib/status.ts` (status tones).
- Path alias `@` → `src/`; always use `@/` imports. TS strict (`noUnusedLocals`, `noUnusedParameters`).
- TanStack Query: `staleTime` 5 min, no refetch on focus; keys `['resource']` / `['resource', id|params]`.

### Dashboard (`pages/DashboardPage.tsx`) — current state
- `SectionCards` (KPIs) read `useDashboardSummary()` (`/api/dashboard/summary/`); the unread-notifications card keeps `useUnreadCount()` so notification mutations refresh it.
- `ChartAreaInteractive` still uses generated random data (the summary's `endingByMonth`/`topOperators` are there to replace it); the "Secções" `DataTable` uses a hard-coded English sample array (badged "Dados de demonstração"). `DataTable` imports `zod`, which is only a transitive dependency (via eslint-plugin-react-hooks) — add it to `package.json` before relying on it.
- Imported customers' `created_at` is the import date, so "new customers over time" charts are meaningless for legacy data.

### Key Conventions
- `CustomerService` Portuguese fields (`acesso`, `tarifario`, `operadora`, `valor`, `moeda`, `conta`, `cvp`, `data_fim`, `num_client`, `num_servico`, `observacoes`, `morada`) are mapped **manually** in `transformCustomerService()` and explicit create/update payloads. Do NOT rely on `toBackend()` for CustomerService mutations.
- Services, documents and address are nested REST resources under `/api/customers/{customer_id}/`.
- List screens use server-side pages (`customersApi.getPage`); `getAll`/`getByCustomerId` auto-follow DRF `next` URLs.
- The client flattens nested service `children[]` via `flattenServices()`.
- Document upload uses `FormData` with raw `fetch` (no JSON Content-Type), bypassing `fetchWithAuth`.
- In dev the API is `AllowAny`, but the SPA's `ProtectedRoute` still requires a logged-in session (`/api/auth/me/`), so log in with a superuser.

## Request Flow
- **Local dev**: Vite proxies `/api/*` → `VITE_API_PROXY_TARGET` (default `http://localhost:8000`).
- **Docker**: nginx (:80) → `/api`, `/admin`, `/static` to Django; everything else to Vite (HMR).
- **Production**: nginx → `/api`, `/admin` to uWSGI over `/run/uwsgi/crm.sock`; `/static/` from `crm-backend/staticfiles/`; `/media/` from `/opt/app/data/`; SPA from `crm-frontend/dist/` with `index.html` fallback.

## Production & Deployment

- **Host**: one DigitalOcean VM, `134.209.11.176`, domain `https://app.jvlcomunicacoes.com` (Let's Encrypt via certbot; HTTP→HTTPS redirect on the domain, plain HTTP still served on the bare IP). See `docs/adr/001-enable-https.md`, `docs/production-https-setup.md`.
- **Layout on VM**: repo cloned at `/opt/app/jvl`, venv `crm-backend/.venv`, env file `/opt/app/crm-backend.env` (template: `scripts/config/crm-backend.env`), uploads `/opt/app/data/`, runs as user `deploy`.
- **Services**: `crm-backend.service` (uWSGI, 2 processes × 2 threads, `Type=notify`, `reload` = graceful SIGHUP); `crm-notifications.timer` → `crm-notifications.service` daily 07:00 Europe/Lisbon running `generate_service_ending_notifications`. PostgreSQL 16 local on the VM. Logs: `/var/log/uwsgi/crm.log`, `/var/log/uwsgi/crm-django-errors.log` (logrotate, 14 days).
- **Config templates** live in `scripts/config/` (nginx-crm.conf, nginx-crm-pre-ssl.conf, uwsgi.ini, crm-backend.service, logrotate-uwsgi) and `scripts/systemd/`. Editing them does not change the VM — `setup-vm.sh` copies them once; re-apply manually otherwise.

### Deploying
Deploys are pull-based: the scripts SSH to the VM (`scripts/common.sh`: `root@134.209.11.176`, key `~/.ssh/januario_rsa`) and `git pull origin main` there. **Merge and push to `main` first**; local unpushed changes are never deployed.

```bash
scripts/deploy-backend.sh               # pull, pip install -r requirements.txt, migrate, collectstatic, reload uWSGI, verify
scripts/deploy-frontend.sh              # pull, npm ci, npm run build (nginx serves dist/, no restart)
scripts/install-notifications-timer.sh  # (re)install the daily notifications timer — idempotent
scripts/setup-vm.sh                     # one-time provisioning of a fresh VM (Python 3.13, Node 22, PG 16, nginx, certbot, uWSGI, systemd)
```

Run both deploy scripts when a change spans backend and frontend (backend first if the frontend depends on new endpoints). Backend deploys run migrations against the prod DB automatically — review migrations before merging.

### Git workflow
Feature branches → PR → squash-merge to `main` (PR number in the subject, e.g. `feat: … (#24)`). Branches created from `origin/main` track it, so set the upstream explicitly (`git push -u origin <branch>`) to avoid pushing straight to `main`.
