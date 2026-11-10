<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class PublicMenuController extends Controller
{
    /**
     * Display the public menu for customers.
     */
    public function show(Request $request, string $slug): Response
    {
        $slug = strtolower(trim($slug));

        // Invalidate key is restaurant-specific
        $restaurant = Restaurant::where('slug', $slug)
            ->with(['latestSubscription'])
            ->first();

        if (! $restaurant) {
            return Inertia::render('PublicMenu/NotFound', [
                'slug' => $slug,
            ]);
        }

        // Check subscription status
        $hasActiveSub = $restaurant->hasActiveSubscription();
        $isPublished = $restaurant->is_published;

        if (! $hasActiveSub || ! $isPublished) {
            return Inertia::render('PublicMenu/Unavailable', [
                'restaurantName' => $restaurant->name,
                'logoUrl' => $restaurant->logo_url,
                'brandColor' => $restaurant->brand_color,
                'reason' => ! $isPublished ? 'draft' : 'subscription_expired',
                'whatsappUrl' => $restaurant->formatted_whatsapp_url,
                'phone' => $restaurant->phone_number,
            ]);
        }

        // Cache categories & items for fast loading (cache tag or key invalidated on menu update)
        $cacheKey = "public_menu_{$restaurant->id}_{$restaurant->updated_at->timestamp}";
        $menuData = Cache::remember($cacheKey, 3600, function () use ($restaurant) {
            $categories = $restaurant->categories()
                ->where('is_active', true)
                ->with(['menuItems' => function ($q) {
                    $q->orderBy('display_order');
                }])
                ->orderBy('display_order')
                ->get();

            return $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'display_order' => $category->display_order,
                    'items' => $category->menuItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,
                            'description' => $item->description,
                            'price' => (float) $item->price,
                            'image_url' => $item->image_url,
                            'is_available' => (bool) $item->is_available,
                            'display_order' => $item->display_order,
                        ];
                    }),
                ];
            });
        });

        return Inertia::render('PublicMenu/Show', [
            'restaurant' => [
                'id' => $restaurant->id,
                'name' => $restaurant->name,
                'slug' => $restaurant->slug,
                'description' => $restaurant->description,
                'brand_color' => $restaurant->brand_color,
                'logo_url' => $restaurant->logo_url,
                'cover_url' => $restaurant->cover_url,
                'whatsapp_url' => $restaurant->formatted_whatsapp_url,
                'phone' => $restaurant->phone_number,
                'currency' => config('saas.currency_symbol_ar', 'ج.م'),
            ],
            'categories' => $menuData,
        ]);
    }
}
