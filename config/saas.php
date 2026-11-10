<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Egyptian Restaurant Menu SaaS Configuration
    |--------------------------------------------------------------------------
    */

    // Annual subscription fee in EGP
    'annual_price' => env('SAAS_ANNUAL_PRICE', 300),

    // Currency code and symbols
    'currency' => 'EGP',
    'currency_symbol_ar' => 'ج.م',
    'currency_symbol_en' => 'EGP',

    // Standard subscription duration in days
    'subscription_days' => 365,

    // Grace period after expiration before public menu is disabled (in days)
    'grace_period_days' => 7,

    // Upload quotas
    'max_image_size_kb' => 2048, // 2MB
    'max_images_per_restaurant' => 100,

    // Support WhatsApp number for owners to contact Super Admin for activation/renewal
    'admin_support_whatsapp' => env('ADMIN_SUPPORT_WHATSAPP', '201000000000'),
    'admin_support_phone' => env('ADMIN_SUPPORT_PHONE', '01000000000'),

    // Dedicated Super Admin URL path (security by obscurity & long isolated folder)
    'admin_path' => env('ADMIN_ROUTE_PATH', 'fastpage-secure-superadmin-control-center'),
];
