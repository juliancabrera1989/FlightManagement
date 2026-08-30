#!/usr/bin/env bash

# Limpiar y optimizar configuraciones de Laravel al arrancar
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Correr migraciones automáticamente
php artisan migrate --force

# Iniciar Apache en primer plano
apache2-foreground