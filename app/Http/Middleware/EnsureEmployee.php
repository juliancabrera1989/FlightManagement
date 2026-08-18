<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;


class EnsureEmployee
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || auth()->user()->role !== 'employee') {
            abort(403, 'Unauthorized - Employees only.');
        }

        return $next($request);
    }
}


// class EnsureEmployee
// {
//     /**
//      * Handle an incoming request.
//      *
//      * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
//      */
//     public function handle(Request $request, Closure $next): Response
//     {
//         return $next($request);
//     }
// }



// class EnsureEmployee
// {
//     public function handle($request, Closure $next)
//     {
//         if (!Auth::check() || !Auth::user()->isEmployee()) {
//             abort(403, 'Unauthorized action.');
//         }
//         return $next($request);
//     }
// }


// <?php

// namespace App\Http\Middleware;

// use Closure;
// use Illuminate\Http\Request;
// use Symfony\Component\HttpFoundation\Response;

