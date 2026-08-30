<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log; // <-- IMPORTACIÓN QUE FALTABA

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if (config('app.env') === 'production' || request()->header('X-Forwarded-Proto') === 'https') {
            URL::forceScheme('https');
            if (config('app.url')) {
                URL::forceRootUrl(config('app.url'));
            }
        }

        // Registrar peticiones en logs
        Log::info('📥 PETICIÓN ENTRANTE:', [
            'url'    => request()->fullUrl(),
            'method' => request()->method(),
            'user'   => auth()->id() ?? 'Invitado/Guest',
        ]);
    }
}