#!/bin/bash

echo "Fixing Laravel permissions..."

chown -R www-data:www-data \
    /var/www/storage \
    /var/www/bootstrap/cache

chmod -R 775 \
    /var/www/storage \
    /var/www/bootstrap/cache


echo "Clearing Laravel cache..."

php artisan config:clear || true
php artisan cache:clear || true
php artisan view:clear || true


echo "Starting PHP-FPM..."

exec php-fpm
