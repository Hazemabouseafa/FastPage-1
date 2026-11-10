<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Media;
use App\Models\MenuItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MenuItemController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $restaurant = $request->user()->restaurant;

        $validated = $request->validate([
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')->where('restaurant_id', $restaurant->id),
            ],
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'is_available' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,webp,jpg', 'max:' . config('saas.max_image_size_kb', 2048)],
        ], [
            'category_id.required' => 'يرجى اختيار قسم للصنف.',
            'category_id.exists' => 'القسم المختار غير صحيح.',
            'name.required' => 'اسم الصنف أو الوجبة مطلوب.',
            'price.required' => 'سعر الصنف بالجنيه المصري مطلوب.',
            'price.numeric' => 'يرجى إدخال سعر صحيح بالأرقام.',
            'image.max' => 'أقصى حجم لصورة الصنف 2 ميجابايت.',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('items', 'public');

            Media::create([
                'restaurant_id' => $restaurant->id,
                'file_path' => $imagePath,
                'file_name' => $request->file('image')->getClientOriginalName(),
                'mime_type' => $request->file('image')->getMimeType(),
                'file_size' => $request->file('image')->getSize(),
                'disk' => 'public',
            ]);
        }

        $maxOrder = $restaurant->menuItems()
            ->where('category_id', $validated['category_id'])
            ->max('display_order') ?? 0;

        $item = MenuItem::create([
            'restaurant_id' => $restaurant->id,
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'image_path' => $imagePath,
            'is_available' => $request->boolean('is_available', true),
            'display_order' => $maxOrder + 1,
        ]);

        AuditLog::log(
            action: 'menu_item.created',
            description: "إضافة صنف جديد: '{$item->name}' بسعر {$item->price} ج.م",
            restaurant: $restaurant
        );

        return back()->with('success', "تمت إضافة '{$item->name}' إلى قائمة الطعام بنجاح.");
    }

    public function update(Request $request, MenuItem $menuItem): RedirectResponse
    {
        $this->authorize('update', $menuItem);
        $restaurant = $menuItem->restaurant;

        $validated = $request->validate([
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')->where('restaurant_id', $restaurant->id),
            ],
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'is_available' => ['nullable', 'boolean'],
            'remove_image' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,webp,jpg', 'max:' . config('saas.max_image_size_kb', 2048)],
        ], [
            'name.required' => 'اسم الصنف مطلوب.',
            'price.required' => 'سعر الصنف مطلوب.',
            'category_id.exists' => 'القسم المختار غير صحيح.',
        ]);

        if ($request->boolean('remove_image')) {
            if ($menuItem->image_path) {
                Storage::disk('public')->delete($menuItem->image_path);
                $menuItem->image_path = null;
            }
        }

        if ($request->hasFile('image')) {
            if ($menuItem->image_path) {
                Storage::disk('public')->delete($menuItem->image_path);
            }
            $imagePath = $request->file('image')->store('items', 'public');
            $menuItem->image_path = $imagePath;

            Media::create([
                'restaurant_id' => $restaurant->id,
                'file_path' => $imagePath,
                'file_name' => $request->file('image')->getClientOriginalName(),
                'mime_type' => $request->file('image')->getMimeType(),
                'file_size' => $request->file('image')->getSize(),
                'disk' => 'public',
            ]);
        }

        $menuItem->category_id = $validated['category_id'];
        $menuItem->name = $validated['name'];
        $menuItem->description = $validated['description'] ?? null;
        $menuItem->price = $validated['price'];
        if ($request->has('is_available')) {
            $menuItem->is_available = $request->boolean('is_available');
        }
        $menuItem->save();

        AuditLog::log(
            action: 'menu_item.updated',
            description: "تعديل الصنف: '{$menuItem->name}'",
            restaurant: $restaurant
        );

        return back()->with('success', "تم تحديث '{$menuItem->name}' بنجاح.");
    }

    public function toggleAvailability(MenuItem $menuItem): RedirectResponse
    {
        $this->authorize('update', $menuItem);

        $menuItem->is_available = ! $menuItem->is_available;
        $menuItem->save();

        $statusText = $menuItem->is_available ? 'متوفر حالياً' : 'غير متوفر (نفد)';

        AuditLog::log(
            action: 'menu_item.availability_toggled',
            description: "تغيير توفر الصنف '{$menuItem->name}' إلى: {$statusText}",
            restaurant: $menuItem->restaurant
        );

        return back()->with('success', "تم تحديث حالة '{$menuItem->name}' إلى ({$statusText}).");
    }

    public function destroy(MenuItem $menuItem): RedirectResponse
    {
        $this->authorize('delete', $menuItem);

        $name = $menuItem->name;
        $restaurant = $menuItem->restaurant;

        if ($menuItem->image_path) {
            Storage::disk('public')->delete($menuItem->image_path);
        }

        $menuItem->delete();

        AuditLog::log(
            action: 'menu_item.deleted',
            description: "حذف الصنف '{$name}' من القائمة",
            restaurant: $restaurant
        );

        return back()->with('success', "تم حذف '{$name}' بنجاح.");
    }
}
