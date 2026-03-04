# ADR-001: Enable HTTPS with TLS termination

**Date:** 2026-03-04
**Status:** Pending

## Context

The CRM application runs on a DigitalOcean VM (`134.209.11.176`) behind Nginx, currently serving all traffic over plain HTTP on port 80. Session-based authentication is working, but the production Django settings had to disable secure cookie flags (`SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`) because the browser silently drops `Secure` cookies on HTTP connections.

This means:

- Session cookies and CSRF tokens are transmitted in plaintext, vulnerable to interception
- User credentials (username/password) are sent unencrypted during login
- The application cannot use `Secure`, `SameSite=None`, or `__Host-` cookie prefixes

## Decision

Enable HTTPS using Let's Encrypt (Certbot) with Nginx TLS termination.

## Implementation plan

1. **Assign a domain name** to the VM (or use an existing one) — Let's Encrypt requires a domain, not a bare IP
2. **Install Certbot** and the Nginx plugin:
   ```bash
   apt install certbot python3-certbot-nginx
   ```
3. **Obtain certificate** and auto-configure Nginx:
   ```bash
   certbot --nginx -d yourdomain.com
   ```
4. **Re-enable secure cookie flags** in `crm-backend/config/settings/production.py`:
   ```python
   SESSION_COOKIE_SECURE = True
   CSRF_COOKIE_SECURE = True
   ```
5. **Add HSTS header** in production settings:
   ```python
   SECURE_HSTS_SECONDS = 31536000
   SECURE_HSTS_INCLUDE_SUBDOMAINS = True
   SECURE_SSL_REDIRECT = True
   ```
6. **Update `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS`** env vars to use the `https://` domain
7. **Verify auto-renewal** works:
   ```bash
   certbot renew --dry-run
   ```

## Consequences

- All traffic encrypted in transit
- Secure cookie flags can be safely re-enabled
- Certbot auto-renews certificates (cron/systemd timer) — no manual maintenance
- Requires a domain name pointing to the VM
