<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;


class EnsurePassenger
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || auth()->user()->role !== 'passenger') {
            abort(403, 'Unauthorized - Passengers only.');
        }

        return $next($request);
    }
}