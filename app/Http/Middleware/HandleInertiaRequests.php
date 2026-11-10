<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $restaurant = null;

        if ($user && ! $user->isSuperAdmin()) {
            $restaurant = $user->restaurant;
            if ($restaurant) {
                $restaurant->loadMissing('latestSubscription');
                $restaurant->append([
                    'subscription_status',
                    'days_remaining',
                    'public_url',
                    'formatted_whatsapp_url',
                    'logo_url',
                ]);
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'restaurant' => $restaurant,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'saas' => [
                'annual_price' => config('saas.annual_price', 300),
                'currency' => config('saas.currency', 'EGP'),
                'currency_symbol_ar' => config('saas.currency_symbol_ar', 'ج.م'),
                'admin_support_whatsapp' => config('saas.admin_support_whatsapp'),
                'admin_support_phone' => config('saas.admin_support_phone'),
            ],
        ];
    }
}
