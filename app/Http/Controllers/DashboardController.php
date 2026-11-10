<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $restaurant = $request->user()->restaurant;
        $restaurant->loadMissing([
            'latestSubscription',
            'categories' => function ($q) {
                $q->withCount('menuItems')->orderBy('display_order');
            },
            'menuItems' => function ($q) {
                $q->with('category:id,name')->orderBy('display_order');
            },
        ]);

        $restaurant->append([
            'subscription_status',
            'days_remaining',
            'public_url',
            'formatted_whatsapp_url',
            'logo_url',
            'cover_url',
        ]);

        $items = $restaurant->menuItems->map(function ($item) {
            $item->append('image_url');
            return $item;
        });

        $stats = [
            'total_items' => $items->count(),
            'available_items' => $items->where('is_available', true)->count(),
            'unavailable_items' => $items->where('is_available', false)->count(),
            'total_categories' => $restaurant->categories->count(),
            'is_published' => $restaurant->is_published,
            'has_active_subscription' => $restaurant->hasActiveSubscription(),
            'subscription_status' => $restaurant->subscription_status,
            'days_remaining' => $restaurant->days_remaining,
        ];

        return Inertia::render('Dashboard', [
            'restaurant' => $restaurant,
            'categories' => $restaurant->categories,
            'items' => $items,
            'stats' => $stats,
        ]);
    }
}
