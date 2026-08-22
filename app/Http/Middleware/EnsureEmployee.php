<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;


class EnsureEmployee
{
    // public function handle(Request $request, Closure $next): Response
    // {
    //     if (!auth()->check() || auth()->user()->role !== 'employee') {
    //         abort(403, 'Unauthorized - Employees only.');
    //     }

    //     return $next($request);
    // }



    // public function handle(Request $request, Closure $next)
    // {
    //     $user = auth()->user();

    //     // Permitir acceso si es empleado de aeropuerto O empleado de aerolínea (o admin)
    //     if ($user && in_array($user->role, ['airport_employee', 'airline_employee', 'employee', 'admin'])) {
    //         return $next($request);
    //     }

    //     abort(403, 'No tienes permisos de empleado para acceder a esta sección.');
    // }


    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        // Verificamos que esté logueado y que su rol sea alguno de los permitidos
        $allowedRoles = ['employee', 'airport_employee', 'airline_employee', 'admin'];

        if (!$user || !in_array($user->role, $allowedRoles)) {
            abort(403, 'Unauthorized - Employees only.');
        }

        return $next($request);
    }
}

