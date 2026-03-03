#!/bin/sh
set -e

echo "🔄 Clearing cache..."

php bin/console cache:clear --no-warmup

echo "🔄 Running migrations..."
php bin/console doctrine:migrations:migrate --no-interaction

echo "🚀 Starting server..."
exec php -S 0.0.0.0:9000 -t public
