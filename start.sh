#!/bin/sh

# Limpiar cachés, enlace simbólico y migraciones al arrancar
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
php artisan storage:link
php artisan migrate --force

# Forzar a Nginx a usar nuestra configuración eliminando el sitio por defecto
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/conf.d/default.conf
ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default 2>/dev/null || true

# Iniciar Nginx en segundo plano y PHP-FPM en primer plano
nginx &
php-fpm