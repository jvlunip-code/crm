#!/usr/bin/env bash
# scripts/deploy-frontend.sh — Deploy frontend updates to the VM
# Run from your local machine: ./scripts/deploy-frontend.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

info "Deploying frontend to $VM_HOST..."

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

# 2. Install Node dependencies
info "Installing Node dependencies..."
cd crm-frontend
npm ci

# 3. Build production bundle
info "Building frontend..."
npm run build

info "Frontend deployed. Nginx serves dist/ directly — no restart needed."

REMOTE_SCRIPT

success "Frontend deployment complete!"
