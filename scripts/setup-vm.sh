#!/usr/bin/env bash
# scripts/setup-vm.sh — One-time VM provisioning for CRM application
# Run from your local machine: ./scripts/setup-vm.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ─── Prompt for database password ────────────────────────────────────────────
read -sp "Enter PostgreSQL password for 'crm' user: " DB_PASSWORD
echo
if [[ -z "$DB_PASSWORD" ]]; then
    error "Password cannot be empty"
    exit 1
fi

info "Starting VM provisioning on $VM_HOST..."

# ─── Upload config files first ───────────────────────────────────────────────
info "Uploading config files..."
scp -i "$SSH_KEY" \
    "$SCRIPT_DIR/config/crm-backend.service" \
    "$SCRIPT_DIR/config/uwsgi.ini" \
    "$SCRIPT_DIR/config/nginx-crm.conf" \
    "$SCRIPT_DIR/config/logrotate-uwsgi" \
    "$VM_USER@$VM_HOST:/tmp/"

# ─── Run provisioning over SSH ───────────────────────────────────────────────
ssh_vm bash -s "$DB_PASSWORD" "$GIT_REPO_URL" "$GIT_BRANCH" << 'REMOTE_SCRIPT'
set -euo pipefail

DB_PASSWORD="$1"
GIT_REPO_URL="$2"
GIT_BRANCH="$3"

info() { echo -e "\033[1;34m==>\033[0m \033[1m$*\033[0m"; }
error() { echo -e "\033[1;31m==>\033[0m \033[1m$*\033[0m" >&2; }

export DEBIAN_FRONTEND=noninteractive

# 1. System update
info "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# 2. Install base system dependencies
info "Installing system dependencies..."
apt-get install -y -qq build-essential libpq-dev curl git software-properties-common

# 3. Install Python 3.13 via deadsnakes PPA
info "Installing Python 3.13..."
add-apt-repository -y ppa:deadsnakes/ppa
apt-get update -qq
apt-get install -y -qq python3.13 python3.13-venv python3.13-dev

# 4. Install Node.js 22.x via NodeSource
info "Installing Node.js 22.x..."
if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y -qq nodejs
fi
echo "Node.js $(node --version), npm $(npm --version)"

# 5. Install PostgreSQL 16
info "Installing PostgreSQL 16..."
if ! dpkg -l | grep -q postgresql-16; then
    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
    apt-get update -qq
    apt-get install -y -qq postgresql-16
fi

# 6. Install nginx and certbot
info "Installing nginx and certbot..."
apt-get install -y -qq nginx certbot python3-certbot-nginx

# 7. Create deploy user
info "Creating deploy user..."
if ! id deploy &>/dev/null; then
    useradd --system --shell /bin/bash --home-dir /opt/app deploy
fi

# 8. Create directory structure
info "Creating directories..."
mkdir -p /opt/app/data
mkdir -p /var/log/uwsgi
mkdir -p /run/uwsgi

chown -R deploy:deploy /opt/app
chown deploy:deploy /var/log/uwsgi

# Ensure /run/uwsgi persists across reboots
cat > /etc/tmpfiles.d/uwsgi.conf << 'EOF'
d /run/uwsgi 0755 deploy deploy -
EOF
chown deploy:deploy /run/uwsgi

# 9. Configure PostgreSQL database and user
info "Configuring PostgreSQL..."
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='crm'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE USER crm WITH PASSWORD '$DB_PASSWORD';"
    sudo -u postgres psql -c "CREATE DATABASE crm OWNER crm;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE crm TO crm;"
fi

# 10. Clone the git repo
info "Cloning repository..."
if [[ ! -d /opt/app/jvl/.git ]]; then
    sudo -u deploy git clone -b "$GIT_BRANCH" "$GIT_REPO_URL" /opt/app/jvl
else
    info "Repository already exists, pulling latest..."
    sudo -u deploy bash -c "cd /opt/app/jvl && git pull origin $GIT_BRANCH"
fi

# 11. Create Python virtual environment
info "Setting up Python virtual environment..."
if [[ ! -d /opt/app/jvl/crm-backend/.venv ]]; then
    sudo -u deploy python3.13 -m venv /opt/app/jvl/crm-backend/.venv
fi

# 12. Install Python dependencies
info "Installing Python dependencies..."
sudo -u deploy /opt/app/jvl/crm-backend/.venv/bin/pip install --upgrade pip
sudo -u deploy /opt/app/jvl/crm-backend/.venv/bin/pip install -r /opt/app/jvl/crm-backend/requirements.txt

# 13. Install Node dependencies
info "Installing Node dependencies..."
sudo -u deploy bash -c "cd /opt/app/jvl/crm-frontend && npm ci"

# 14. Generate environment file
info "Generating environment file..."
if [[ ! -f /opt/app/crm-backend.env ]]; then
    SECRET_KEY=$(python3.13 -c "import secrets; print(secrets.token_urlsafe(50))")
    cat > /opt/app/crm-backend.env << EOF
DJANGO_SETTINGS_MODULE=config.settings.production
DJANGO_SECRET_KEY=$SECRET_KEY
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com
CSRF_TRUSTED_ORIGINS=https://your-domain.com
POSTGRES_DB=crm
POSTGRES_USER=crm
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
MEDIA_ROOT=/opt/app/data/
EOF
    chown deploy:deploy /opt/app/crm-backend.env
    chmod 600 /opt/app/crm-backend.env
else
    info "Environment file already exists, skipping..."
fi

# 15. Install config files
info "Installing config files..."
cp /tmp/crm-backend.service /etc/systemd/system/crm-backend.service
cp /tmp/uwsgi.ini /opt/app/jvl/crm-backend/uwsgi.ini
chown deploy:deploy /opt/app/jvl/crm-backend/uwsgi.ini
cp /tmp/nginx-crm.conf /etc/nginx/sites-available/crm
ln -sf /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/crm
rm -f /etc/nginx/sites-enabled/default
cp /tmp/logrotate-uwsgi /etc/logrotate.d/uwsgi

# Add www-data to deploy group so nginx can access the uwsgi socket
usermod -aG deploy www-data

# 16. Run initial Django setup
info "Running Django migrations..."
sudo -u deploy bash -c "
    set -a
    source /opt/app/crm-backend.env
    set +a
    /opt/app/jvl/crm-backend/.venv/bin/python /opt/app/jvl/crm-backend/manage.py migrate --noinput
"

info "Collecting static files..."
sudo -u deploy bash -c "
    set -a
    source /opt/app/crm-backend.env
    set +a
    /opt/app/jvl/crm-backend/.venv/bin/python /opt/app/jvl/crm-backend/manage.py collectstatic --noinput
"

# 17. Build frontend
info "Building frontend..."
sudo -u deploy bash -c "cd /opt/app/jvl/crm-frontend && npm run build"

# 18. Enable and start services
info "Enabling services..."
systemctl daemon-reload
systemctl enable crm-backend
systemctl start crm-backend

# Configure sudoers for deploy user (for deploy scripts)
cat > /etc/sudoers.d/deploy << 'EOF'
deploy ALL=(ALL) NOPASSWD: /bin/systemctl reload crm-backend, /bin/systemctl restart crm-backend, /bin/systemctl status crm-backend *
EOF
chmod 440 /etc/sudoers.d/deploy

nginx -t && systemctl restart nginx

# 19. Configure firewall
info "Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 20. Print next steps
echo ""
echo "=============================================="
echo "  VM provisioning complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo ""
echo "  1. Edit /opt/app/crm-backend.env"
echo "     - Set ALLOWED_HOSTS to your domain"
echo "     - Set CORS_ALLOWED_ORIGINS to https://your-domain"
echo "     - Set CSRF_TRUSTED_ORIGINS to https://your-domain"
echo ""
echo "  2. Update nginx server_name:"
echo "     sudo sed -i 's/server_name _;/server_name your-domain.com;/' /etc/nginx/sites-available/crm"
echo "     sudo systemctl restart nginx"
echo ""
echo "  3. Set up SSL with certbot:"
echo "     sudo certbot --nginx -d your-domain.com"
echo ""
echo "  4. Create a Django superuser:"
echo "     sudo -u deploy bash -c 'set -a; source /opt/app/crm-backend.env; set +a; /opt/app/jvl/crm-backend/.venv/bin/python /opt/app/jvl/crm-backend/manage.py createsuperuser'"
echo ""
echo "  5. Restart the backend after env changes:"
echo "     sudo systemctl restart crm-backend"
echo ""

REMOTE_SCRIPT

success "VM provisioning complete!"
