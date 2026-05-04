#!/usr/bin/env bash
# =============================================================================
# AgriPool — Production Deploy Script
# Target OS  : Ubuntu 22.04 LTS (DigitalOcean / Hetzner VPS)
# Monorepo   : agripool/ (Laravel 11) + frontend/ (React + Vite)
# Usage      : sudo bash deploy.sh <your-domain.com>
# =============================================================================
set -euo pipefail

# ── Colour helpers ─────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── Config ─────────────────────────────────────────────────────────────────
DOMAIN="${1:-}"
REPO_URL="${REPO_URL:-https://github.com/YOUR_ORG/Sharing_Transportation.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="/var/www/agripool"
LARAVEL_DIR="${APP_DIR}/agripool"
FRONTEND_DIR="${APP_DIR}/frontend"
WEB_USER="www-data"
PHP_VER="8.2"
MYSQL_DB="agripool_db"
MYSQL_USER="agripool"
MYSQL_PASS="${MYSQL_PASS:-$(openssl rand -base64 20)}"   # override via env or auto-generated
NODE_MAJOR=20

[[ -z "$DOMAIN" ]] && error "Usage: sudo bash deploy.sh <your-domain.com>"
[[ "$EUID" -ne 0 ]] && error "This script must be run as root (sudo)"

# ────────────────────────────────────────────────────────────────────────────
# STEP 1 — System update + basic tools
# ────────────────────────────────────────────────────────────────────────────
info "Updating system packages…"
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl wget gnupg2 software-properties-common unzip git ufw fail2ban

# ── UFW firewall ───────────────────────────────────────────────────────────
info "Configuring UFW firewall…"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
success "UFW configured."

# ────────────────────────────────────────────────────────────────────────────
# STEP 2 — Install PHP 8.2-fpm + required extensions
# ────────────────────────────────────────────────────────────────────────────
info "Installing PHP ${PHP_VER}-fpm and extensions…"
add-apt-repository -y ppa:ondrej/php >/dev/null 2>&1
apt-get update -qq
apt-get install -y -qq \
    php${PHP_VER}-fpm \
    php${PHP_VER}-cli \
    php${PHP_VER}-mysql \
    php${PHP_VER}-mbstring \
    php${PHP_VER}-xml \
    php${PHP_VER}-bcmath \
    php${PHP_VER}-curl \
    php${PHP_VER}-zip \
    php${PHP_VER}-intl \
    php${PHP_VER}-readline \
    php${PHP_VER}-gd \
    php${PHP_VER}-tokenizer
systemctl enable php${PHP_VER}-fpm
success "PHP ${PHP_VER}-fpm installed."

# ────────────────────────────────────────────────────────────────────────────
# STEP 3 — Install Nginx
# ────────────────────────────────────────────────────────────────────────────
info "Installing Nginx…"
apt-get install -y -qq nginx
systemctl enable nginx
success "Nginx installed."

# ────────────────────────────────────────────────────────────────────────────
# STEP 4 — Install MySQL 8.0
# ────────────────────────────────────────────────────────────────────────────
info "Installing MySQL 8.0…"
apt-get install -y -qq mysql-server

systemctl enable mysql
systemctl start mysql

# Secure MySQL and create app DB + user
info "Configuring MySQL…"
mysql -u root <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost','127.0.0.1','::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
CREATE DATABASE IF NOT EXISTS \`${MYSQL_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'localhost' IDENTIFIED BY '${MYSQL_PASS}';
GRANT ALL PRIVILEGES ON \`${MYSQL_DB}\`.* TO '${MYSQL_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF
success "MySQL configured. DB: ${MYSQL_DB}  User: ${MYSQL_USER}"
warn "MySQL password: ${MYSQL_PASS}  ← Save this securely!"

# ────────────────────────────────────────────────────────────────────────────
# STEP 5 — Install Composer
# ────────────────────────────────────────────────────────────────────────────
info "Installing Composer…"
EXPECTED_CHECKSUM="$(php -r 'copy("https://composer.github.io/installer.sig", "php://stdout");')"
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
ACTUAL_CHECKSUM="$(php -r "echo hash_file('sha384', 'composer-setup.php');")"
[[ "$EXPECTED_CHECKSUM" != "$ACTUAL_CHECKSUM" ]] && error "Composer installer checksum mismatch!"
php composer-setup.php --install-dir=/usr/local/bin --filename=composer --quiet
rm composer-setup.php
success "Composer installed: $(composer --version --no-ansi)"

# ────────────────────────────────────────────────────────────────────────────
# STEP 6 — Install Node.js 20 + npm
# ────────────────────────────────────────────────────────────────────────────
info "Installing Node.js ${NODE_MAJOR}…"
curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - >/dev/null 2>&1
apt-get install -y -qq nodejs
success "Node.js installed: $(node --version)  npm: $(npm --version)"

# ────────────────────────────────────────────────────────────────────────────
# STEP 7 — Clone repository
# ────────────────────────────────────────────────────────────────────────────
info "Cloning repository to ${APP_DIR}…"
mkdir -p "${APP_DIR}"

if [[ -d "${APP_DIR}/.git" ]]; then
    info "Repository already exists — pulling latest ${BRANCH}…"
    git -C "${APP_DIR}" fetch origin
    git -C "${APP_DIR}" reset --hard "origin/${BRANCH}"
else
    git clone --branch "${BRANCH}" --depth 1 "${REPO_URL}" "${APP_DIR}"
fi
success "Repository ready at ${APP_DIR}."

# ────────────────────────────────────────────────────────────────────────────
# STEP 8 — Laravel setup
# ────────────────────────────────────────────────────────────────────────────
info "Setting up Laravel backend…"
cd "${LARAVEL_DIR}"

# Install PHP dependencies (production only)
composer install --no-dev --optimize-autoloader --no-interaction --quiet
success "Composer dependencies installed."

# Copy production env file
if [[ ! -f .env ]]; then
    if [[ -f .env.production ]]; then
        cp .env.production .env
        info "Copied .env.production → .env"
    else
        cp .env.example .env
        warn "No .env.production found — copied .env.example. Edit /var/www/agripool/agripool/.env before proceeding!"
    fi
fi

# Inject DB credentials from this script into .env
sed -i "s|^DB_DATABASE=.*|DB_DATABASE=${MYSQL_DB}|" .env
sed -i "s|^DB_USERNAME=.*|DB_USERNAME=${MYSQL_USER}|" .env
sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${MYSQL_PASS}|" .env
sed -i "s|^APP_URL=.*|APP_URL=https://${DOMAIN}|" .env
sed -i "s|^APP_ENV=.*|APP_ENV=production|" .env
sed -i "s|^APP_DEBUG=.*|APP_DEBUG=false|" .env

# Generate application key (idempotent — won't overwrite if already set)
php artisan key:generate --force
success "APP_KEY generated."

# Run migrations
php artisan migrate --force
success "Database migrations applied."

# Optimise framework caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
success "Laravel caches warmed."

# ────────────────────────────────────────────────────────────────────────────
# STEP 9 — React frontend build
# ────────────────────────────────────────────────────────────────────────────
info "Building React frontend…"
cd "${FRONTEND_DIR}"
npm ci --silent
npm run build
success "Frontend built."

# Copy Vite dist output to where Nginx will serve it
FRONTEND_DIST="${LARAVEL_DIR}/public/frontend"
rm -rf "${FRONTEND_DIST}"
cp -r "${FRONTEND_DIR}/dist" "${FRONTEND_DIST}"
success "Frontend assets copied to ${FRONTEND_DIST}."

# ────────────────────────────────────────────────────────────────────────────
# STEP 10 — Storage directories + permissions
# ────────────────────────────────────────────────────────────────────────────
info "Setting file permissions…"
chown -R "${WEB_USER}:${WEB_USER}" "${APP_DIR}"
chmod -R 755 "${APP_DIR}"
chmod -R 775 "${LARAVEL_DIR}/storage"
chmod -R 775 "${LARAVEL_DIR}/bootstrap/cache"
php "${LARAVEL_DIR}/artisan" storage:link --force 2>/dev/null || true
success "Permissions set."

# ────────────────────────────────────────────────────────────────────────────
# STEP 11 — Nginx configuration
# ────────────────────────────────────────────────────────────────────────────
info "Writing Nginx server block for ${DOMAIN}…"
NGINX_CONF="/etc/nginx/sites-available/agripool"

cat > "${NGINX_CONF}" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    # ── Security headers ──────────────────────────────────────────────────
    add_header X-Frame-Options           "SAMEORIGIN"  always;
    add_header X-XSS-Protection          "1; mode=block" always;
    add_header X-Content-Type-Options    "nosniff"     always;
    add_header Referrer-Policy           "strict-origin-when-cross-origin" always;

    # ── Gzip compression ─────────────────────────────────────────────────
    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript application/json;
    gzip_min_length 256;

    # ── Laravel API — /api routes go to PHP-FPM ───────────────────────────
    location /api {
        root    ${LARAVEL_DIR}/public;
        index   index.php;
        try_files \$uri \$uri/ /index.php?\$query_string;

        location ~ \.php$ {
            fastcgi_pass  unix:/var/run/php/php${PHP_VER}-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
            include fastcgi_params;
            fastcgi_hide_header X-Powered-By;
        }
    }

    # ── Laravel static assets (e.g. storage/app/public) ──────────────────
    location /storage {
        root  ${LARAVEL_DIR}/public;
        try_files \$uri =404;
    }

    # ── React SPA — everything else ───────────────────────────────────────
    location / {
        root  ${LARAVEL_DIR}/public/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;   # client-side SPA routing fallback

        # Cache built assets aggressively (Vite fingerprints filenames)
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|woff|ttf)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # ── Block sensitive files ─────────────────────────────────────────────
    location ~ /\.(ht|git|env) { deny all; }
}
NGINX

ln -sf "${NGINX_CONF}" /etc/nginx/sites-enabled/agripool
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
success "Nginx configured and reloaded."

# ────────────────────────────────────────────────────────────────────────────
# STEP 12 — SSL with Certbot
# ────────────────────────────────────────────────────────────────────────────
info "Installing Certbot and configuring SSL for ${DOMAIN}…"
apt-get install -y -qq certbot python3-certbot-nginx

certbot --nginx \
    --non-interactive \
    --agree-tos \
    --redirect \
    --email "admin@${DOMAIN}" \
    -d "${DOMAIN}" \
    -d "www.${DOMAIN}"

# Auto-renew cron (certbot installs its own timer, but add a safety net)
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | sort -u | crontab -
success "SSL certificate issued for ${DOMAIN}."

# ────────────────────────────────────────────────────────────────────────────
# STEP 13 — PHP-FPM tuning (optional but recommended)
# ────────────────────────────────────────────────────────────────────────────
info "Tuning PHP-FPM pool…"
PHP_POOL="/etc/php/${PHP_VER}/fpm/pool.d/www.conf"
sed -i 's/^pm = .*/pm = ondemand/'          "${PHP_POOL}"
sed -i 's/^pm.max_children = .*/pm.max_children = 20/' "${PHP_POOL}"
sed -i 's/^pm.process_idle_timeout = .*/pm.process_idle_timeout = 10s/' "${PHP_POOL}"
systemctl restart php${PHP_VER}-fpm
success "PHP-FPM restarted."

# ────────────────────────────────────────────────────────────────────────────
# DONE
# ────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🎉  AgriPool deployed successfully!             ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║${NC}  URL      : https://${DOMAIN}"
echo -e "${GREEN}║${NC}  API      : https://${DOMAIN}/api/v1"
echo -e "${GREEN}║${NC}  App dir  : ${APP_DIR}"
echo -e "${GREEN}║${NC}  DB name  : ${MYSQL_DB}"
echo -e "${GREEN}║${NC}  DB user  : ${MYSQL_USER}"
echo -e "${YELLOW}║${NC}  DB pass  : ${MYSQL_PASS}  ← SAVE THIS!"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
