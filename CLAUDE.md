# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Internal CRM for JVL Comunicações (Portuguese telecom/utilities back-office): customers, their services/contracts, documents, and service-ending notifications. Django REST Framework backend + React (Vite + TypeScript) frontend in one repo (`github.com/jvlunip-code/crm`). UI text is **Portuguese (pt-PT)**. Product intent and design principles: `PRODUCT.md`; visual system: `crm-frontend/DESIGN.md`; frontend specifics: `crm-frontend/CLAUDE.md`. `migration/` (legacy MySQL dump) is gitignored and local only.

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
python manage.py generate_service_ending_notifications   # what the prod daily timer runs
python manage.py import_legacy [--dry-run]
python manage.py sync_tarifarios [--dry-run]               # backfill Tarifario from existing services (idempotent)

# Frontend (crm-frontend/)
npm run build      # tsc -b && vite build — the real type check
npm run lint       # ESLint (currently 2 errors / 4 warnings on main)
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
| `customers` | `/api/customers/` (ModelViewSet), `/api/customers/suggest/?q=`, `/api/customers/{id}/address/` (singleton, PUT upserts) | Own pagination: 10/page, `?page_size=` up to 100, `?ordering=`, `?status=active|inactive` (Customers list tabs). `?search=` uses `Customer.objects.search()`: Postgres full-text prefix match on generated `search_vector` columns (accent-insensitive via `immutable_unaccent`), numeric NIF/phone matching, trigram fallback for typos (`fuzzy` flag). Also `CustomerContact` and `LegacyImportMap` models (legacy import). |
| `customers` → tags | `/api/tags/` (ModelViewSet, unpaginated, `customer_count`), `?tag=<id>` filter on `/api/customers/` | Finder-style `Tag` (name unique ignoring case, `color` ∈ red/orange/yellow/green/blue/purple/gray), M2M `Customer.tags`. Customers embed `tags[]`; PATCH `tag_ids` (frontend `tagIds`) replaces them. Colours are `--tag-*` tokens in `index.css` (`bg-tag-red`…, mapped in `lib/tags.ts`). |
| `services` | `/api/customers/{id}/services/` (CRUD), `/api/services/` (read-only, all customers) | Parent/child hierarchy (max 1 level, validated in `clean()`); nested responses have `children[]`. `/api/services/` is flat (sub-services are rows, with `customer_name`), 10/page, `?search=` (icontains on service fields + customer name/company), `?ending=expired|90|180|270`, `?ordering=`. Also `/api/tarifarios/` (all known tarifário names, unpaginated) backed by the `Tarifario` table: filled by a `post_save` signal on `CustomerService` (`signals.py` → `tarifarios.register_tarifario`; unique ignoring case, whitespace collapsed) and backfilled by `manage.py sync_tarifarios`. `bulk_create` skips the signal — run `sync_tarifarios` after bulk inserts. |
| `documents` | `/api/customers/{id}/documents/[{pk}/[download/]]` | Custom ViewSet. Videos blocked; max `DOCUMENT_MAX_FILE_SIZE` (default **25 MB**); images >2 MB and PDFs compressed on upload (`file_compression.py`, Pillow/pikepdf). |
| `dashboard` | `/api/dashboard/summary/` | Aggregates in `summary.py`: customers, services (active = no `data_fim` or `data_fim` ≥ today, Lisbon date; sub-services counted), ending buckets reusing the notification windows (expired/≤90/≤180/≤270 days), next-12-months `ending_by_month`, top operators, unread notifications. `within_90`-style keys are mapped by hand in `dashboardApi` (generic camelCase transform skips digits). |
| `notifications` | `/api/notifications/` + `mark_read`, `mark_unread`, `mark_all_read`, `dismiss`, `generate_service_ending` | `SERVICO_A_TERMINAR` rows generated by a use case (`use_cases/generate_service_ending.py`, pydantic schemas), deduped by `dedup_key`. Run daily in prod by a systemd timer. |

API specs (Portuguese): `crm-backend/specs/` (copies in `crm-frontend/docs/`) — older than the code; trust the serializers.

### Key Conventions
- Services, documents and address are nested REST resources under `/api/customers/{customer_id}/`. Frontend conventions (manual CustomerService field mapping, pagination, uploads) are in `crm-frontend/CLAUDE.md`.
- In dev the API is `AllowAny`, but the SPA's `ProtectedRoute` still requires a logged-in session (`/api/auth/me/`), so log in with a superuser.

## Production & Deployment
Full prod reference (VM layout, services, logs, nginx flow, deploy scripts) is in the `deploy` skill (`.claude/skills/deploy/SKILL.md`). Always-on rules:
- Deploys `git pull origin main` on the VM — **merge and push to `main` first**; local unpushed changes are never deployed.
- Backend deploys run migrations against the prod DB automatically — review migrations before merging.
- Editing config templates in `scripts/config/` / `scripts/systemd/` does not change the VM; re-apply manually.

### Git workflow
Feature branches → PR → squash-merge to `main` (PR number in the subject, e.g. `feat: … (#24)`). Branches created from `origin/main` track it, so set the upstream explicitly (`git push -u origin <branch>`) to avoid pushing straight to `main`.
