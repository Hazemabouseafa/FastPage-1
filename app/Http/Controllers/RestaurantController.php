<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Media;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RestaurantController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $restaurant = $request->user()->restaurant;
        $this->authorize('update', $restaurant);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'whatsapp_number' => ['required', 'string', 'max:20', 'regex:/^(01[0125][0-9]{8}|\+?201[0125][0-9]{8})$/'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'brand_color' => ['required', 'string', 'regex:/^#([a-fA-F0-9]{6})$/'],
            'description' => ['nullable', 'string', 'max:500'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,webp,jpg', 'max:' . config('saas.max_image_size_kb', 2048)],
            'cover' => ['nullable', 'image', 'mimes:jpeg,png,webp,jpg', 'max:' . config('saas.max_image_size_kb', 2048)],
        ], [
            'name.required' => 'اسم المطعم مطلوب.',
            'whatsapp_number.required' => 'رقم الواتساب مطلوب.',
            'whatsapp_number.regex' => 'يرجى إدخال رقم واتساب مصري صالح.',
            'brand_color.required' => 'يرجى اختيار لون هوية المطعم.',
            'logo.max' => 'أقصى حجم مسموح به لشعار المطعم 2 ميجابايت.',
            'cover.max' => 'أقصى حجم مسموح به لصورة الغلاف 2 ميجابايت.',
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($restaurant->logo_path) {
                Storage::disk('public')->delete($restaurant->logo_path);
            }
            $logoPath = $request->file('logo')->store('logos', 'public');
            $restaurant->logo_path = $logoPath;

            Media::create([
                'restaurant_id' => $restaurant->id,
                'file_path' => $logoPath,
                'file_name' => $request->file('logo')->getClientOriginalName(),
                'mime_type' => $request->file('logo')->getMimeType(),
                'file_size' => $request->file('logo')->getSize(),
                'disk' => 'public',
            ]);
        }

        if ($request->hasFile('cover')) {
            if ($restaurant->cover_path) {
                Storage::disk('public')->delete($restaurant->cover_path);
            }
            $coverPath = $request->file('cover')->store('covers', 'public');
            $restaurant->cover_path = $coverPath;

            Media::create([
                'restaurant_id' => $restaurant->id,
                'file_path' => $coverPath,
                'file_name' => $request->file('cover')->getClientOriginalName(),
                'mime_type' => $request->file('cover')->getMimeType(),
                'file_size' => $request->file('cover')->getSize(),
                'disk' => 'public',
            ]);
        }

        $restaurant->update([
            'name' => $validated['name'],
            'whatsapp_number' => $validated['whatsapp_number'],
            'phone_number' => $validated['phone_number'] ?? null,
            'brand_color' => $validated['brand_color'],
            'description' => $validated['description'] ?? null,
        ]);

        AuditLog::log(
            action: 'restaurant.updated',
            description: "تحديث إعدادات مطعم '{$restaurant->name}'",
            restaurant: $restaurant
        );

        return back()->with('success', 'تم حفظ تعديلات المطعم بنجاح.');
    }

    public function togglePublish(Request $request): RedirectResponse
    {
        $restaurant = $request->user()->restaurant;
        $this->authorize('update', $restaurant);

        $restaurant->is_published = ! $restaurant->is_published;
        $restaurant->save();

        $statusText = $restaurant->is_published ? 'منشور للعامة' : 'معطل ومخفي عن الزوار';

        AuditLog::log(
            action: 'restaurant.publish_toggled',
            description: "تغيير حالة نشر المطعم إلى: {$statusText}",
            restaurant: $restaurant,
            payload: ['is_published' => $restaurant->is_published]
        );

        return back()->with('success', "تم تغيير حالة نشر المنيو بنجاح ({$statusText}).");
    }
}
