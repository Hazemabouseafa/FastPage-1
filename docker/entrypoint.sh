#!/bin/sh
set -e

echo "=== [FastPage SaaS] Initializing container startup ==="

# 1. Create storage directories if missing
mkdir -p /var/www/html/storage/app/public
mkdir -p /var/www/html/storage/app/persistent
mkdir -p /var/www/html/storage/framework/cache/data
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache

# 2. Fix directory ownership and permissions immediately
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# 3. Ensure .env exists
if [ ! -f /var/www/html/.env ]; then
    echo "Creating .env from .env.example..."
    cp /var/www/html/.env.example /var/www/html/.env 2>/dev/null || touch /var/www/html/.env
fi

# 4. Check & generate APP_KEY if missing, empty, or invalid
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = '""' ] || [ "$APP_KEY" = "base64:" ]; then
    echo "APP_KEY is not set. Applying default fallback key..."
    DEFAULT_KEY="base64:7VndV1oU70m7zHhUls9B5tJ2Pz2+U4qWq8tY7g8Z0u0="
    export APP_KEY="$DEFAULT_KEY"
    sed -i "s|^APP_KEY=.*|APP_KEY=$DEFAULT_KEY|" /var/www/html/.env 2>/dev/null || echo "APP_KEY=$DEFAULT_KEY" >> /var/www/html/.env
fi

# 5. Ensure public storage symlink exists
php artisan storage:link || true

# 6. Wait for PostgreSQL to be ready before running migrations
DB_HOST_CHECK="${DB_HOST:-postgres}"
DB_PORT_CHECK="${DB_PORT:-5432}"
DB_NAME_CHECK="${DB_DATABASE:-qrmenu}"
DB_USER_CHECK="${DB_USERNAME:-postgres}"
DB_PASS_CHECK="${DB_PASSWORD:-secretpassword123}"

echo "Waiting for PostgreSQL at $DB_HOST_CHECK:$DB_PORT_CHECK to be ready..."
MAX_TRIES=30
COUNT=0
while [ $COUNT -lt $MAX_TRIES ]; do
    if php -r "try { new PDO('pgsql:host=${DB_HOST_CHECK};port=${DB_PORT_CHECK};dbname=${DB_NAME_CHECK}', '${DB_USER_CHECK}', '${DB_PASS_CHECK}', [PDO::ATTR_TIMEOUT => 2]); exit(0); } catch(\Throwable \$e) { exit(1); }"; then
        echo "PostgreSQL is ready and accepting connections!"
        break
    fi
    COUNT=$((COUNT + 1))
    echo "Waiting for database connection (attempt $COUNT/$MAX_TRIES)..."
    sleep 2
done

# 7. Run database migrations
echo "Running database migrations..."
php artisan migrate --force || echo "Warning: migrations had non-zero exit, continuing..."

# 8. Seed database idempotently (ensures Super Admin and demo restaurant exist)
echo "Running database seeds..."
php artisan db:seed --force || echo "Warning: db:seed had non-zero exit, continuing..."

# 9. Guarantee Super Admin account exists
echo "Ensuring Super Admin account exists..."
php artisan saas:admin admin@hazem --name="حازم - مدير FastPage" --phone="01000000000" --password="bhgihbhggi33M@" || true

# 10. Sync customer data to persistent volume
php artisan saas:sync-customers || true

# 11. Clear caches to ensure runtime environment variables are fresh
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# 12. Re-verify permissions before launching
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

echo "=== [FastPage SaaS] Container initialization complete. Starting Supervisor ==="
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
