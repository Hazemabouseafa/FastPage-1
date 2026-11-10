<!DOCTYPE html>
<html lang="ar" dir="rtl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
        <meta name="theme-color" content="#ea580c">
        <meta name="format-detection" content="telephone=no">
        <meta name="description" content="FastPage - حلول رقمية سريعة لمطعمك وكافيهك. أنشئ منيو إلكتروني احترافي بـ QR Code في دقائق معدودة.">
        <link rel="icon" type="image/png" href="/images/fastpage-logo.png">

        <title inertia>{{ config('app.name', 'FastPage') }} - حلول رقمية سريعة لمطعمك وكافيهك</title>

        <!-- Google Cairo Font (Arabic Optimized) -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-cairo antialiased bg-gray-50 text-gray-900 selection:bg-orange-500 selection:text-white min-h-screen">
        @inertia
    </body>
</html>
