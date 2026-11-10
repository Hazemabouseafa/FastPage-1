#!/bin/sh
set -e

echo "Starting QR Restaurant Menu SaaS container..."

# Create storage directories if missing
mkdir -p /var/www/html/storage/app/public
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs

# Fix permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Ensure public storage symlink exists
php artisan storage:link || true

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force

# Production cache optimization
if [ "$APP_ENV" = "production" ]; then
    echo "Caching configuration, routes, and views..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

echo "Starting services via Supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
