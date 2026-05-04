#!/usr/bin/env bash
# =============================================================================
# AgriPool — Zero-downtime re-deploy script (for subsequent pushes)
# Run this instead of the full deploy.sh after the first setup is done.
# Usage: sudo bash redeploy.sh
# =============================================================================
set -euo pipefail

APP_DIR="/var/www/agripool"
LARAVEL_DIR="${APP_DIR}/agripool"
FRONTEND_DIR="${APP_DIR}/frontend"
PHP_VER="8.2"
BRANCH="${BRANCH:-main}"
WEB_USER="www-data"

GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }

# ── Pull latest code ────────────────────────────────────────────────────────
info "Pulling latest code from ${BRANCH}…"
git -C "${APP_DIR}" fetch origin
git -C "${APP_DIR}" reset --hard "origin/${BRANCH}"

# ── Laravel ─────────────────────────────────────────────────────────────────
info "Updating Laravel dependencies…"
cd "${LARAVEL_DIR}"
composer install --no-dev --optimize-autoloader --no-interaction --quiet

info "Putting site into maintenance mode…"
php artisan down --retry=5 --secret="agripool-bypass-$(date +%s)"

info "Running migrations…"
php artisan migrate --force

info "Refreshing caches…"
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# ── Frontend ─────────────────────────────────────────────────────────────────
info "Rebuilding React frontend…"
cd "${FRONTEND_DIR}"
npm ci --silent
npm run build

FRONTEND_DIST="${LARAVEL_DIR}/public/frontend"
rm -rf "${FRONTEND_DIST}"
cp -r "${FRONTEND_DIR}/dist" "${FRONTEND_DIST}"

# ── Permissions ──────────────────────────────────────────────────────────────
chown -R "${WEB_USER}:${WEB_USER}" "${APP_DIR}"
chmod -R 775 "${LARAVEL_DIR}/storage" "${LARAVEL_DIR}/bootstrap/cache"

# ── Restart services ─────────────────────────────────────────────────────────
info "Restarting PHP-FPM…"
systemctl restart php${PHP_VER}-fpm

info "Bringing site back online…"
php "${LARAVEL_DIR}/artisan" up

success "Re-deploy complete!"
