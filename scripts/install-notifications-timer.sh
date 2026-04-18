#!/usr/bin/env bash
# scripts/install-notifications-timer.sh — install/update the notifications systemd timer on the VM.
# Idempotent: safe to run repeatedly. Uses the same SSH helpers as the other deploy scripts.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

info "Installing crm-notifications timer on $VM_HOST..."

# Copy unit files to the VM first (they live in the repo under scripts/systemd/)
scp -o StrictHostKeyChecking=accept-new -i "$SSH_KEY" \
    "$SCRIPT_DIR/systemd/crm-notifications.service" \
    "$SCRIPT_DIR/systemd/crm-notifications.timer" \
    "${VM_USER}@${VM_HOST}:/tmp/"

ssh_vm bash -s << 'REMOTE_SCRIPT'
set -euo pipefail
info() { echo -e "\033[1;34m==>\033[0m \033[1m$*\033[0m"; }

info "Moving unit files into /etc/systemd/system/"
sudo mv /tmp/crm-notifications.service /etc/systemd/system/crm-notifications.service
sudo mv /tmp/crm-notifications.timer   /etc/systemd/system/crm-notifications.timer
sudo chown root:root /etc/systemd/system/crm-notifications.{service,timer}
sudo chmod 644 /etc/systemd/system/crm-notifications.{service,timer}

info "Reloading systemd"
sudo systemctl daemon-reload

info "Enabling timer (idempotent)"
sudo systemctl enable --now crm-notifications.timer

info "Running one immediate backfill pass"
sudo systemctl start crm-notifications.service || true

info "Next scheduled run:"
systemctl list-timers crm-notifications.timer --no-pager || true

REMOTE_SCRIPT

success "Notifications timer installed."
