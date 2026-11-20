---
name: deploy
description: Deploy the JVL CRM to production (DigitalOcean VM) and reference for the prod layout, systemd services, logs, nginx request flow and config templates. Use when deploying, debugging prod, or touching scripts/.
---

# Production & Deployment

## Request Flow
- **Docker**: nginx (:80) → `/api`, `/admin`, `/static` to Django; everything else to Vite (HMR).
- **Production**: nginx → `/api`, `/admin` to uWSGI over `/run/uwsgi/crm.sock`; `/static/` from `crm-backend/staticfiles/`; `/media/` from `/opt/app/data/`; SPA from `crm-frontend/dist/` with `index.html` fallback.

## Production

- **Host**: one DigitalOcean VM, `134.209.11.176`, domain `https://app.jvlcomunicacoes.com` (Let's Encrypt via certbot; HTTP→HTTPS redirect on the domain, plain HTTP still served on the bare IP). See `docs/adr/001-enable-https.md`, `docs/production-https-setup.md`.
- **Layout on VM**: repo cloned at `/opt/app/jvl`, venv `crm-backend/.venv`, env file `/opt/app/crm-backend.env` (template: `scripts/config/crm-backend.env`), uploads `/opt/app/data/`, runs as user `deploy`.
- **Services**: `crm-backend.service` (uWSGI, 2 processes × 2 threads, `Type=notify`, `reload` = graceful SIGHUP); `crm-notifications.timer` → `crm-notifications.service` daily 07:00 Europe/Lisbon running `generate_service_ending_notifications`. PostgreSQL 16 local on the VM. Logs: `/var/log/uwsgi/crm.log`, `/var/log/uwsgi/crm-django-errors.log` (logrotate, 14 days).
- **Config templates** live in `scripts/config/` (nginx-crm.conf, nginx-crm-pre-ssl.conf, uwsgi.ini, crm-backend.service, logrotate-uwsgi) and `scripts/systemd/`. Editing them does not change the VM — `setup-vm.sh` copies them once; re-apply manually otherwise.

## Deploying
Deploys are pull-based: the scripts SSH to the VM (`scripts/common.sh`: `root@134.209.11.176`, key `~/.ssh/januario_rsa`) and `git pull origin main` there. **Merge and push to `main` first**; local unpushed changes are never deployed.

```bash
scripts/deploy-backend.sh               # pull, pip install -r requirements.txt, migrate, collectstatic, reload uWSGI, verify
scripts/deploy-frontend.sh              # pull, npm ci, npm run build (nginx serves dist/, no restart)
scripts/install-notifications-timer.sh  # (re)install the daily notifications timer — idempotent
scripts/setup-vm.sh                     # one-time provisioning of a fresh VM (Python 3.13, Node 22, PG 16, nginx, certbot, uWSGI, systemd)
```

Run both deploy scripts when a change spans backend and frontend (backend first if the frontend depends on new endpoints). Backend deploys run migrations against the prod DB automatically — review migrations before merging.
