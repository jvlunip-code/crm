#!/usr/bin/env bash
# scripts/deploy-backend.sh — Deploy backend updates to the VM
# Run from your local machine: ./scripts/deploy-backend.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

info "Deploying backend to $VM_HOST..."

ssh_vm bash -s "$GIT_BRANCH" << 'REMOTE_SCRIPT'
set -euo pipefail

GIT_BRANCH="$1"

info() { echo -e "\033[1;34m==>\033[0m \033[1m$*\033[0m"; }
error() { echo -e "\033[1;31m==>\033[0m \033[1m$*\033[0m" >&2; }

# 1. Pull latest code
info "Pulling latest code..."
cd /opt/app/jvl
git config --global --add safe.directory /opt/app/jvl
git pull origin "$GIT_BRANCH"

# 2. Install/update Python dependencies
info "Installing Python dependencies..."
crm-backend/.venv/bin/pip install -q -r crm-backend/requirements.txt

# 3. Run Django migrations
info "Running migrations..."
set -a
source /opt/app/crm-backend.env
set +a
crm-backend/.venv/bin/python crm-backend/manage.py migrate --noinput

# 4. Collect static files
info "Collecting static files..."
crm-backend/.venv/bin/python crm-backend/manage.py collectstatic --noinput

# 5. Graceful reload (SIGHUP via systemd, zero-downtime)
info "Reloading backend service..."
sudo /bin/systemctl reload crm-backend

# 6. Verify service is running
sleep 2
if sudo /bin/systemctl status crm-backend --no-pager | grep -q "active (running)"; then
    info "Backend service is running."
else
    error "Backend service may not be running! Check with: systemctl status crm-backend"
    exit 1
fi

REMOTE_SCRIPT

success "Backend deployment complete!"
