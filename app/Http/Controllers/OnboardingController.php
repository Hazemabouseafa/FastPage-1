<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Media;
use App\Models\Restaurant;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->restaurant) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Onboarding/Index', [
            'suggestedSlug' => Str::slug($user->name, '-', 'ar') ?: 'my-restaurant',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->restaurant) {
            return redirect()->route('dashboard');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:restaurants,slug'],
            'whatsapp_number' => ['required', 'string', 'max:20', 'regex:/^(01[0125][0-9]{8}|\+?201[0125][0-9]{8})$/'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'brand_color' => ['nullable', 'string', 'regex:/^#([a-fA-F0-9]{6})$/'],
            'description' => ['nullable', 'string', 'max:500'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,webp,jpg', 'max:' . config('saas.max_image_size_kb', 2048)],
        ], [
            'name.required' => 'اسم المطعم مطلوب.',
            'slug.required' => 'الرابط المختصر مطلوب.',
            'slug.unique' => 'هذا الرابط مستخدم بالفعل، يرجى اختيار رابط آخر.',
            'slug.regex' => 'الرابط المختصر يجب أن يتكون من حروف إنجليزية صغيرة وأرقام وشرطات فقط بدون مسافات (مثال: koshary-tahrir).',
            'whatsapp_number.required' => 'رقم الواتساب مطلوب لتلقي استفسارات الزبائن.',
            'whatsapp_number.regex' => 'يرجى إدخال رقم واتساب مصري صحيح (مثال: 01012345678 أو 201012345678).',
            'logo.image' => 'الملف المرفوع يجب أن يكون صورة.',
            'logo.max' => 'أقصى حجم مسموح به لشعار المطعم هو 2 ميجابايت.',
        ]);

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
        }

        $restaurant = Restaurant::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'slug' => strtolower($validated['slug']),
            'whatsapp_number' => $validated['whatsapp_number'],
            'phone_number' => $validated['phone_number'] ?? null,
            'brand_color' => $validated['brand_color'] ?? '#ea580c',
            'description' => $validated['description'] ?? null,
            'logo_path' => $logoPath,
            'currency' => 'EGP',
            'is_published' => false, // Owner publishes when ready
        ]);

        if ($logoPath) {
            Media::create([
                'restaurant_id' => $restaurant->id,
                'file_path' => $logoPath,
                'file_name' => $request->file('logo')->getClientOriginalName(),
                'mime_type' => $request->file('logo')->getMimeType(),
                'file_size' => $request->file('logo')->getSize(),
                'disk' => 'public',
            ]);
        }

        // Create pending subscription
        Subscription::create([
            'restaurant_id' => $restaurant->id,
            'status' => Subscription::STATUS_PENDING,
            'price_paid' => config('saas.annual_price', 300),
            'notes' => 'في انتظار تفعيل الاشتراك السنوي بقيمة ' . config('saas.annual_price', 300) . ' ج.م من الإدارة',
        ]);

        // Create default initial categories
        $defaultCategories = ['الأطباق الرئيسية', 'المقبلات والسلطات', 'المشروبات'];
        foreach ($defaultCategories as $index => $catName) {
            Category::create([
                'restaurant_id' => $restaurant->id,
                'name' => $catName,
                'display_order' => $index + 1,
                'is_active' => true,
            ]);
        }

        AuditLog::log(
            action: 'restaurant.created',
            description: "إنشاء مطعم جديد باسم '{$restaurant->name}' برابط مختصر '{$restaurant->slug}'",
            restaurant: $restaurant,
            payload: ['slug' => $restaurant->slug]
        );

        return redirect()->route('dashboard')->with('success', 'مبروك! تم إنشاء مطعمك بنجاح. يمكنك الآن إضافة أصناف المنيو وتفعيل الاشتراك.');
    }

    public function checkSlug(Request $request): JsonResponse
    {
        $slug = strtolower(trim((string) $request->query('slug')));

        if (! preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            return response()->json(['valid' => false, 'available' => false, 'message' => 'الرابط غير صالح']);
        }

        $exists = Restaurant::where('slug', $slug)->exists();

        return response()->json([
            'valid' => true,
            'available' => ! $exists,
            'message' => $exists ? 'هذا الرابط محجوز' : 'الرابط متاح للاستخدام',
        ]);
    }
}
