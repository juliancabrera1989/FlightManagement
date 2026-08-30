#!/bin/sh

php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
php artisan storage:link
php artisan migrate --force

nginx &
php-fpm