#!/usr/bin/env bash
# scripts/common.sh — Shared configuration for deployment scripts
# Sourced by setup-vm.sh, deploy-backend.sh, deploy-frontend.sh

set -euo pipefail

# ─── Connection settings (edit these) ────────────────────────────────────────
VM_HOST="134.209.11.176"
VM_USER="root"
SSH_KEY="$HOME/.ssh/januario_rsa"

# ─── Git settings ────────────────────────────────────────────────────────────
GIT_REPO_URL="https://github.com/jvlunip-code/crm"
GIT_BRANCH="main"

# ─── Remote paths ────────────────────────────────────────────────────────────
REMOTE_APP_DIR="/opt/app"
REMOTE_REPO_DIR="$REMOTE_APP_DIR/jvl"
REMOTE_BACKEND_DIR="$REMOTE_REPO_DIR/crm-backend"
REMOTE_FRONTEND_DIR="$REMOTE_REPO_DIR/crm-frontend"
REMOTE_VENV_DIR="$REMOTE_BACKEND_DIR/.venv"
REMOTE_ENV_FILE="$REMOTE_APP_DIR/crm-backend.env"
REMOTE_DATA_DIR="$REMOTE_APP_DIR/data"
DEPLOY_USER="deploy"

# ─── Helper functions ────────────────────────────────────────────────────────

ssh_vm() {
    ssh -o StrictHostKeyChecking=accept-new -i "$SSH_KEY" "$VM_USER@$VM_HOST" "$@"
}

info() {
    echo -e "\033[1;34m==>\033[0m \033[1m$*\033[0m"
}

success() {
    echo -e "\033[1;32m==>\033[0m \033[1m$*\033[0m"
}

error() {
    echo -e "\033[1;31m==>\033[0m \033[1m$*\033[0m" >&2
}
