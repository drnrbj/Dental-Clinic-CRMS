<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Usage in routes:
     *   Route::middleware('role:admin,receptionist')
     *   Route::middleware('role:admin')
     *   Route::middleware('role:dentist,admin')
     *
     * @param  array<string>  $roles  Comma-separated allowed roles from the route definition
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! auth()->check()) {
            return redirect()->route('login');
        }

        if (! in_array(auth()->user()->role, $roles, strict: true)) {
            abort(403, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}