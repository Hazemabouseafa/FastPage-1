<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ستاند طاولة - {{ $restaurant->name }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@500;700;800;900&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Cairo', sans-serif;
            background-color: #f1f5f9;
            color: #0f172a;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px 16px;
            min-height: 100vh;
        }
        .actions-bar {
            width: 100%;
            max-width: 420px;
            margin-bottom: 20px;
            display: flex;
            gap: 12px;
        }
        .btn {
            flex: 1;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 700;
            font-family: 'Cairo', sans-serif;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
        }
        .btn-print {
            background-color: {{ $restaurant->brand_color ?: '#ea580c' }};
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
        }
        .btn-back {
            background-color: #ffffff;
            color: #334155;
            border: 1px solid #cbd5e1;
        }
        /* Stand Card */
        .stand-card {
            width: 100%;
            max-width: 420px;
            background: #ffffff;
            border-radius: 28px;
            padding: 36px 28px;
            text-align: center;
            border: 3px solid {{ $restaurant->brand_color ?: '#ea580c' }};
            box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.08);
            position: relative;
            overflow: hidden;
        }
        .stand-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 10px;
            background: {{ $restaurant->brand_color ?: '#ea580c' }};
        }
        .logo-wrap {
            width: 76px;
            height: 76px;
            margin: 0 auto 16px;
            border-radius: 20px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff7ed;
            border: 2px solid #fed7aa;
        }
        .logo-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .restaurant-name {
            font-size: 24px;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 4px;
        }
        .restaurant-tagline {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 22px;
            font-weight: 500;
        }
        .qr-box {
            background: #ffffff;
            padding: 16px;
            border-radius: 22px;
            display: inline-block;
            margin-bottom: 20px;
            border: 2px dashed {{ $restaurant->brand_color ?: '#ea580c' }};
            box-shadow: 0 8px 16px -4px rgba(0,0,0,0.04);
        }
        .qr-box svg {
            width: 220px;
            height: 220px;
            display: block;
        }
        .scan-pill {
            display: inline-block;
            background: {{ $restaurant->brand_color ?: '#ea580c' }};
            color: #ffffff;
            font-weight: 800;
            font-size: 14px;
            padding: 8px 20px;
            border-radius: 999px;
            margin-bottom: 12px;
        }
        .instructions {
            font-size: 12px;
            color: #64748b;
            line-height: 1.6;
        }
        .footer-note {
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px dashed #e2e8f0;
            font-size: 11px;
            color: #94a3b8;
            font-weight: 600;
        }

        @media print {
            body {
                background: none;
                padding: 0;
            }
            .no-print {
                display: none !important;
            }
            .stand-card {
                border: 2px solid #000000;
                box-shadow: none;
                margin: 0 auto;
                max-width: 90%;
                page-break-inside: avoid;
            }
            @page {
                size: A5 portrait;
                margin: 15mm;
            }
        }
    </style>
</head>
<body>

    <div class="actions-bar no-print">
        <button onclick="window.print()" class="btn btn-print">
            <span>🖨️ طباعة أو حفظ كـ PDF</span>
        </button>
        <button onclick="window.close()" class="btn btn-back">
            <span>إغلاق</span>
        </button>
    </div>

    <div class="stand-card">
        @if ($restaurant->logo_url)
            <div class="logo-wrap">
                <img src="{{ $restaurant->logo_url }}" alt="{{ $restaurant->name }}">
            </div>
        @endif

        <h1 class="restaurant-name">{{ $restaurant->name }}</h1>
        <p class="restaurant-tagline">{{ $restaurant->description ?: 'قائمة الطعام الرقمية' }}</p>

        <div class="qr-box">
            {!! $svgQr !!}
        </div>

        <div>
            <div class="scan-pill">امسح الرمز لتصفح المنيو 📱</div>
            <p class="instructions">
                افتح كاميرا هاتفك المحمول ووجهها نحو الرمز<br>
                بدون الحاجة لتحميل أي تطبيق أو تسجيل
            </p>
        </div>

        <div class="footer-note">
            رابط المنيو: {{ $targetUrl }}
        </div>
    </div>

</body>
</html>
