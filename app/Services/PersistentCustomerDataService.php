<?php

namespace App\Services;

use App\Models\Restaurant;
use App\Models\Subscription;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;

class PersistentCustomerDataService
{
    /**
     * Get the persistent storage directory path.
     */
    public static function getStorageDirectory(): string
    {
        $dir = config('saas.persistent_storage_path', storage_path('app/persistent'));

        if (! File::isDirectory($dir)) {
            File::makeDirectory($dir, 0775, true, true);
        }

        return $dir;
    }

    /**
     * Get the JSON file path in persistent storage.
     */
    public static function getJsonFilePath(): string
    {
        return static::getStorageDirectory() . DIRECTORY_SEPARATOR . 'customers.json';
    }

    /**
     * Get the CSV file path in persistent storage.
     */
    public static function getCsvFilePath(): string
    {
        return static::getStorageDirectory() . DIRECTORY_SEPARATOR . 'customers.csv';
    }

    /**
     * Synchronize all current customer data into persistent storage (JSON & CSV).
     */
    public static function sync(): array
    {
        $restaurants = Restaurant::with([
            'user:id,name,email,phone,created_at',
            'latestSubscription',
        ])
        ->withCount(['categories', 'menuItems'])
        ->orderBy('id', 'asc')
        ->get();

        $annualPrice = (float) SystemSetting::get('annual_subscription_price', config('saas.annual_price', 300));

        $customersList = [];
        $csvRows = [];

        // CSV Header (UTF-8 with Arabic labels)
        $csvRows[] = [
            'رقم_العميل',
            'اسم_المالك',
            'البريد_الإلكتروني',
            'رقم_الهاتف',
            'اسم_المطعم',
            'الرابط_المختصر',
            'رابط_المنيو_العام',
            'رقم_الواتساب',
            'حالة_الاشتراك',
            'تاريخ_بدء_الاشتراك',
            'تاريخ_انتهاء_الاشتراك',
            'الأيام_المتبقية',
            'المبلغ_المدفوع_جم',
            'حالة_النشر',
            'عدد_الأقسام',
            'عدد_الأصناف',
            'تاريخ_التسجيل_في_النظام',
        ];

        foreach ($restaurants as $restaurant) {
            $user = $restaurant->user;
            $sub = $restaurant->latestSubscription;

            $status = $restaurant->subscription_status;
            $daysRemaining = $restaurant->days_remaining;
            $publicUrl = $restaurant->public_url;

            $customerData = [
                'customer_id' => $user?->id,
                'owner_name' => $user?->name ?? 'غير محدد',
                'owner_email' => $user?->email ?? '—',
                'owner_phone' => $user?->phone ?? '—',
                'restaurant_id' => $restaurant->id,
                'restaurant_name' => $restaurant->name,
                'slug' => $restaurant->slug,
                'public_url' => $publicUrl,
                'whatsapp_number' => $restaurant->whatsapp_number,
                'brand_color' => $restaurant->brand_color,
                'is_published' => (bool) $restaurant->is_published,
                'subscription' => [
                    'status' => $status,
                    'price_paid' => $sub ? (float) $sub->price_paid : 0.0,
                    'starts_at' => $sub?->starts_at?->toIso8601String(),
                    'ends_at' => $sub?->ends_at?->toIso8601String(),
                    'days_remaining' => $daysRemaining,
                ],
                'stats' => [
                    'categories_count' => $restaurant->categories_count,
                    'menu_items_count' => $restaurant->menu_items_count,
                ],
                'created_at' => $user?->created_at?->toIso8601String(),
            ];

            $customersList[] = $customerData;

            // Translate status to Arabic for CSV
            $statusAr = match ($status) {
                Subscription::STATUS_ACTIVE => 'نشط (مفعل)',
                Subscription::STATUS_PENDING => 'في انتظار التفعيل',
                Subscription::STATUS_GRACE => 'فترة سماح (تجديد)',
                Subscription::STATUS_EXPIRED => 'منتهي الصلاحية',
                Subscription::STATUS_SUSPENDED => 'معلق من الإدارة',
                default => $status,
            };

            $csvRows[] = [
                $user?->id ?? $restaurant->id,
                $user?->name ?? 'غير محدد',
                $user?->email ?? '—',
                $user?->phone ?? '—',
                $restaurant->name,
                $restaurant->slug,
                $publicUrl,
                $restaurant->whatsapp_number,
                $statusAr,
                $sub?->starts_at?->format('Y-m-d') ?? '—',
                $sub?->ends_at?->format('Y-m-d') ?? '—',
                $daysRemaining,
                $sub ? number_format($sub->price_paid, 2, '.', '') : '0.00',
                $restaurant->is_published ? 'منشور للعامة' : 'مسودة غير منشورة',
                $restaurant->categories_count,
                $restaurant->menu_items_count,
                $user?->created_at?->format('Y-m-d H:i:s') ?? $restaurant->created_at->format('Y-m-d H:i:s'),
            ];
        }

        // Build Master Payload
        $payload = [
            'meta' => [
                'platform' => 'FastPage SaaS',
                'description' => 'ملف بيانات العملاء المشتركين - التخزين الدائم (Persistent Storage)',
                'generated_at' => Carbon::now()->toIso8601String(),
                'annual_subscription_price' => $annualPrice,
                'total_customers' => count($customersList),
                'active_subscriptions' => count(array_filter($customersList, fn($c) => in_array($c['subscription']['status'], [Subscription::STATUS_ACTIVE, Subscription::STATUS_GRACE]))),
            ],
            'customers' => $customersList,
        ];

        // 1. Write JSON file
        $jsonPath = static::getJsonFilePath();
        File::put($jsonPath, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        // 2. Write CSV file with UTF-8 BOM for Arabic support in Excel
        $csvPath = static::getCsvFilePath();
        $fp = fopen($csvPath, 'w');
        // UTF-8 BOM
        fputs($fp, "\xEF\xBB\xBF");
        foreach ($csvRows as $row) {
            fputcsv($fp, $row);
        }
        fclose($fp);

        return [
            'total_customers' => count($customersList),
            'json_file' => $jsonPath,
            'csv_file' => $csvPath,
            'json_size' => File::exists($jsonPath) ? File::size($jsonPath) : 0,
            'csv_size' => File::exists($csvPath) ? File::size($csvPath) : 0,
            'synced_at' => Carbon::now()->toIso8601String(),
        ];
    }

    /**
     * Get metadata about persistent storage files.
     */
    public static function getInfo(): array
    {
        $dir = static::getStorageDirectory();
        $jsonPath = static::getJsonFilePath();
        $csvPath = static::getCsvFilePath();

        $jsonExists = File::exists($jsonPath);
        $csvExists = File::exists($csvPath);

        // If files don't exist yet, perform initial sync
        if (! $jsonExists || ! $csvExists) {
            return static::sync();
        }

        $lastModified = File::lastModified($jsonPath);
        $totalCustomers = Restaurant::count();

        return [
            'exists' => true,
            'directory' => $dir,
            'json_file' => $jsonPath,
            'csv_file' => $csvPath,
            'json_size' => File::size($jsonPath),
            'csv_size' => File::size($csvPath),
            'synced_at' => Carbon::createFromTimestamp($lastModified)->toIso8601String(),
            'synced_at_human' => Carbon::createFromTimestamp($lastModified)->diffForHumans(),
            'total_customers' => $totalCustomers,
        ];
    }
}
