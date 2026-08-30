#!/bin/sh

# Limpiar cachés, enlace simbólico y migraciones al arrancar
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
php artisan storage:link
php artisan migrate --force

# Asegurar que Nginx escuche en el puerto 80 que pide Render
sed -i 's/listen 8080;/listen 80;/g' /etc/nginx/sites-available/default 2>/dev/null || true

# Iniciar Nginx en segundo plano y PHP-FPM en primer plano
nginx &
php-fpm