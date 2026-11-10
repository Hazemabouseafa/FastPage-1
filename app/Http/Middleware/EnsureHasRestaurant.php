<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasRestaurant
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Super Admin bypasses restaurant requirement
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        if (! $user->restaurant) {
            return redirect()->route('onboarding');
        }

        return $next($request);
    }
}
