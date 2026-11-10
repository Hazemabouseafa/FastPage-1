<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Restaurant;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $statusFilter = trim((string) $request->query('status', ''));

        $query = Restaurant::with([
            'user:id,name,email,phone',
            'latestSubscription',
        ])->withCount(['categories', 'menuItems']);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('whatsapp_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        $allRestaurants = $query->orderByDesc('id')->get();

        // Append status and compute statistics
        $restaurants = $allRestaurants->map(function ($rest) {
            $rest->append([
                'subscription_status',
                'days_remaining',
                'public_url',
                'logo_url',
            ]);
            return $rest;
        });

        // Filter by status if requested
        if ($statusFilter !== '') {
            $restaurants = $restaurants->filter(function ($rest) use ($statusFilter) {
                return $rest->subscription_status === $statusFilter;
            })->values();
        }

        $annualPrice = (float) config('saas.annual_price', 300);

        // Global Platform Stats
        $totalRestaurants = Restaurant::count();

        $activeCount = 0;
        $pendingCount = 0;
        $expiredCount = 0;
        $suspendedCount = 0;

        foreach (Restaurant::with('latestSubscription')->get() as $r) {
            $status = $r->subscription_status;
            if ($status === Subscription::STATUS_ACTIVE || $status === Subscription::STATUS_GRACE) {
                $activeCount++;
            } elseif ($status === Subscription::STATUS_PENDING) {
                $pendingCount++;
            } elseif ($status === Subscription::STATUS_SUSPENDED) {
                $suspendedCount++;
            } else {
                $expiredCount++;
            }
        }

        $stats = [
            'total_restaurants' => $totalRestaurants,
            'active_subscriptions' => $activeCount,
            'pending_subscriptions' => $pendingCount,
            'expired_subscriptions' => $expiredCount,
            'suspended_subscriptions' => $suspendedCount,
            'annual_plan_price' => $annualPrice,
            'projected_annual_revenue' => $activeCount * $annualPrice,
            'total_collected' => (float) Subscription::whereIn('status', [Subscription::STATUS_ACTIVE, Subscription::STATUS_EXPIRED])->sum('price_paid'),
        ];

        $recentLogs = AuditLog::with(['user:id,name,role', 'restaurant:id,name,slug'])
            ->orderByDesc('id')
            ->limit(15)
            ->get();

        return Inertia::render('Admin/Index', [
            'restaurants' => $restaurants,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
            'recentLogs' => $recentLogs,
            'adminPrefix' => config('saas.admin_path', 'fastpage-secure-superadmin-control-center'),
        ]);
    }

    public function activateSubscription(Request $request, Restaurant $restaurant): RedirectResponse
    {
        $days = (int) config('saas.subscription_days', 365);
        $annualPrice = (float) config('saas.annual_price', 300);

        $subscription = Subscription::create([
            'restaurant_id' => $restaurant->id,
            'status' => Subscription::STATUS_ACTIVE,
            'starts_at' => now(),
            'ends_at' => now()->addDays($days),
            'price_paid' => $annualPrice,
            'notes' => 'تفعيل اشتراك سنوي (365 يوماً) يدوي بواسطة مدير النظام',
            'renewed_by_user_id' => $request->user()->id,
        ]);

        AuditLog::log(
            action: 'subscription.activated',
            description: "تفعيل اشتراك سنوي لمطعم '{$restaurant->name}' لمدة 365 يوماً بقيمة {$annualPrice} ج.م",
            restaurant: $restaurant,
            payload: ['subscription_id' => $subscription->id, 'ends_at' => $subscription->ends_at->toIso8601String()]
        );

        return back()->with('success', "تم تفعيل اشتراك مطعم '{$restaurant->name}' بنجاح لمدة 365 يوماً.");
    }

    public function renewSubscription(Request $request, Restaurant $restaurant): RedirectResponse
    {
        $days = (int) config('saas.subscription_days', 365);
        $annualPrice = (float) config('saas.annual_price', 300);

        $latestSub = $restaurant->latestSubscription;
        $baseDate = ($latestSub && $latestSub->ends_at && $latestSub->ends_at->isFuture())
            ? $latestSub->ends_at
            : Carbon::now();

        $newEndsAt = $baseDate->copy()->addDays($days);

        $subscription = Subscription::create([
            'restaurant_id' => $restaurant->id,
            'status' => Subscription::STATUS_ACTIVE,
            'starts_at' => now(),
            'ends_at' => $newEndsAt,
            'price_paid' => $annualPrice,
            'notes' => 'تجديد اشتراك سنوي إضافي بواسطة مدير النظام',
            'renewed_by_user_id' => $request->user()->id,
        ]);

        AuditLog::log(
            action: 'subscription.renewed',
            description: "تجديد اشتراك مطعم '{$restaurant->name}' لسنة إضافية حتى " . $newEndsAt->format('Y-m-d'),
            restaurant: $restaurant,
            payload: ['subscription_id' => $subscription->id, 'new_ends_at' => $newEndsAt->toIso8601String()]
        );

        return back()->with('success', "تم تجديد اشتراك '{$restaurant->name}' بنجاح حتى " . $newEndsAt->format('Y-m-d') . ".");
    }

    public function suspendSubscription(Request $request, Restaurant $restaurant): RedirectResponse
    {
        $latestSub = $restaurant->latestSubscription;

        if ($latestSub) {
            $latestSub->status = Subscription::STATUS_SUSPENDED;
            $latestSub->save();
        } else {
            Subscription::create([
                'restaurant_id' => $restaurant->id,
                'status' => Subscription::STATUS_SUSPENDED,
                'notes' => 'تم تعليق الحساب بواسطة الإدارة',
                'renewed_by_user_id' => $request->user()->id,
            ]);
        }

        AuditLog::log(
            action: 'subscription.suspended',
            description: "تعليق حساب مطعم '{$restaurant->name}'",
            restaurant: $restaurant
        );

        return back()->with('success', "تم تعليق حساب مطعم '{$restaurant->name}'. لن يتمكن الزبائن من تصفح المنيو.");
    }

    public function unsuspendSubscription(Request $request, Restaurant $restaurant): RedirectResponse
    {
        $latestSub = $restaurant->latestSubscription;

        if ($latestSub) {
            // Restore status based on ends_at
            if ($latestSub->ends_at && $latestSub->ends_at->isFuture()) {
                $latestSub->status = Subscription::STATUS_ACTIVE;
            } else {
                $latestSub->status = Subscription::STATUS_EXPIRED;
            }
            $latestSub->save();
        }

        AuditLog::log(
            action: 'subscription.unsuspended',
            description: "إلغاء تعليق مطعم '{$restaurant->name}'",
            restaurant: $restaurant
        );

        return back()->with('success', "تم إلغاء تعليق مطعم '{$restaurant->name}'.");
    }

    public function destroyRestaurant(Restaurant $restaurant): RedirectResponse
    {
        $name = $restaurant->name;
        $restaurant->delete();

        AuditLog::log(
            action: 'restaurant.deleted',
            description: "حذف المطعم '{$name}' نهائياً من قبل مدير النظام"
        );

        return back()->with('success', "تم حذف المطعم '{$name}' بنجاح.");
    }
}
