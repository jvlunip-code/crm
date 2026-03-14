# Production HTTPS Setup

Guide for enabling HTTPS on the CRM production server (`134.209.11.176`) with domain `app.jvlcomunicacoes.com`.

## Prerequisites

- Domain A record pointing to the server IP (`134.209.11.176`)
- Server provisioned with `scripts/setup-vm.sh`
- Certbot and Nginx plugin installed: `apt install certbot python3-certbot-nginx`

## DNS Setup

In cPanel (or your DNS provider), create an A record:

| Type | Name | Value |
|------|------|-------|
| A | app | 134.209.11.176 |

Verify propagation: `dig +short app.jvlcomunicacoes.com` should return `134.209.11.176`.

## Deployment Steps

### 1. Fix production `.env` file

Edit `/opt/app/crm-backend.env` on the server. The `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` values **must** include the scheme (`https://`):

```
ALLOWED_HOSTS=134.209.11.176,app.jvlcomunicacoes.com
CORS_ALLOWED_ORIGINS=http://134.209.11.176,https://app.jvlcomunicacoes.com
CSRF_TRUSTED_ORIGINS=http://134.209.11.176,https://app.jvlcomunicacoes.com
```

`ALLOWED_HOSTS` does **not** include the scheme (Django strips it). `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` **require** the full origin with scheme.

### 2. Deploy backend

```bash
scripts/deploy-backend.sh
```

This pulls the latest code, installs dependencies, runs migrations, collects static files, and reloads uWSGI.

### 3. Install pre-SSL Nginx config (for Certbot)

Certbot's `--nginx` plugin needs a server block with `server_name` that serves HTTP (no redirect). Use the pre-SSL config first:

```bash
cp /opt/app/jvl/scripts/config/nginx-crm-pre-ssl.conf /etc/nginx/sites-available/crm
ln -sf /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/crm
nginx -t && systemctl reload nginx
```

### 4. Issue SSL certificate with Certbot

```bash
certbot --nginx -d app.jvlcomunicacoes.com
```

Certbot will:
- Find the `server_name app.jvlcomunicacoes.com` block
- Verify domain ownership via HTTP challenge
- Obtain the certificate from Let's Encrypt
- Auto-modify the Nginx config to add SSL

### 5. Replace with final Nginx config

After Certbot succeeds, replace with the full HTTPS config (HTTP→HTTPS redirect, security headers):

```bash
cp /opt/app/jvl/scripts/config/nginx-crm.conf /etc/nginx/sites-available/crm
nginx -t && systemctl reload nginx
```

### 6. Verify certificate auto-renewal

```bash
certbot renew --dry-run
```

Certbot installs a systemd timer (`certbot.timer`) that runs renewal checks twice daily.

### 7. Update uWSGI config and reload

```bash
cp /opt/app/jvl/scripts/config/uwsgi.ini /etc/uwsgi/apps-available/crm.ini
systemctl reload crm-backend
```

### 8. Verify

```bash
# Should return 200 with Strict-Transport-Security header
curl -I https://app.jvlcomunicacoes.com

# Should return 301 redirect to HTTPS
curl -I http://app.jvlcomunicacoes.com

# Test login flow in browser
```

## Django Environment Variables Reference

| Variable | Format | Example |
|----------|--------|---------|
| `ALLOWED_HOSTS` | Comma-separated hostnames (no scheme) | `134.209.11.176,app.jvlcomunicacoes.com` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated full origins (with scheme) | `http://134.209.11.176,https://app.jvlcomunicacoes.com` |
| `CSRF_TRUSTED_ORIGINS` | Comma-separated full origins (with scheme) | `http://134.209.11.176,https://app.jvlcomunicacoes.com` |

## Nginx Config

The Nginx config (`scripts/config/nginx-crm.conf`) defines three server blocks:

1. **HTTP on domain (port 80)** — redirects to HTTPS with 301
2. **HTTP on IP (port 80)** — serves the app directly (for health checks / internal access)
3. **HTTPS on domain (port 443)** — main production block with SSL, security headers, and `X-Forwarded-Proto` for Django

Security headers set by Nginx:
- `Strict-Transport-Security` — tells browsers to always use HTTPS
- `X-Content-Type-Options: nosniff` — prevents MIME type sniffing
- `X-Frame-Options: DENY` — prevents clickjacking

## Error Logs

| Log file | Source | Content |
|----------|--------|---------|
| `/var/log/uwsgi/crm.log` | uWSGI | 4xx/5xx responses, slow requests (>3s) |
| `/var/log/uwsgi/crm-django-errors.log` | Django | `django.request` and `django.security` errors |
| `/var/log/nginx/error.log` | Nginx | Upstream errors, config issues |

Check Django errors:
```bash
tail -f /var/log/uwsgi/crm-django-errors.log
```

Check uWSGI errors:
```bash
tail -f /var/log/uwsgi/crm.log
```

All logs in `/var/log/uwsgi/` are rotated daily (14 days retention) via logrotate.

## Troubleshooting

### 502 Bad Gateway — uWSGI crash loop

**Symptom:** Nginx returns `502 Bad Gateway`. `systemctl status crm-backend` shows the service in `activating (auto-restart)` with exit code 22.

**Root cause (2026-03-14):** The Django log file `/var/log/uwsgi/crm-django-errors.log` was owned by `root:root`. uWSGI runs as the `deploy` user and Django's `RotatingFileHandler` couldn't open the file for writing, which crashed the entire WSGI application on startup:

```
ValueError: Unable to configure handler 'file'
*** no app loaded. GAME OVER ***
```

**Fix:**
```bash
sudo chown deploy:deploy /var/log/uwsgi/crm-django-errors.log
sudo systemctl restart crm-backend
```

**Prevention:** The deploy script (`scripts/deploy-backend.sh`) now ensures the log file exists with correct ownership before reloading uWSGI. If a new log file is added to the Django `LOGGING` config, it must also be added to the deploy script.

> **Note:** Logrotate is configured with `create 0640 deploy deploy` so rotated files get the right ownership, but the *initial* file creation (or manual `touch` as root) can still cause this issue.

### Certificate Troubleshooting

**Check certificate status:**
```bash
certbot certificates
```

**Force renewal:**
```bash
certbot renew --force-renewal
systemctl reload nginx
```

**Certificate not found errors:** Verify the paths in Nginx config match the Certbot live directory:
```
/etc/letsencrypt/live/app.jvlcomunicacoes.com/fullchain.pem
/etc/letsencrypt/live/app.jvlcomunicacoes.com/privkey.pem
```

**Rate limits:** Let's Encrypt allows 5 duplicate certificates per week. If you hit the limit, wait or use `--staging` for testing.
