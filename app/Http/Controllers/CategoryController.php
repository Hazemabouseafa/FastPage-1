<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $restaurant = $request->user()->restaurant;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80'],
        ], [
            'name.required' => 'يرجى كتابة اسم القسم.',
            'name.max' => 'اسم القسم يجب ألا يتجاوز 80 حرفاً.',
        ]);

        $maxOrder = $restaurant->categories()->max('display_order') ?? 0;

        $category = Category::create([
            'restaurant_id' => $restaurant->id,
            'name' => $validated['name'],
            'display_order' => $maxOrder + 1,
            'is_active' => true,
        ]);

        AuditLog::log(
            action: 'category.created',
            description: "إضافة قسم جديد: '{$category->name}'",
            restaurant: $restaurant
        );

        return back()->with('success', "تم إضافة قسم '{$category->name}' بنجاح.");
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $this->authorize('update', $category);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'is_active' => ['nullable', 'boolean'],
        ], [
            'name.required' => 'يرجى كتابة اسم القسم.',
        ]);

        $category->update([
            'name' => $validated['name'],
            'is_active' => $request->has('is_active') ? (bool) $request->is_active : $category->is_active,
        ]);

        AuditLog::log(
            action: 'category.updated',
            description: "تعديل قسم: '{$category->name}'",
            restaurant: $category->restaurant
        );

        return back()->with('success', 'تم حفظ تعديلات القسم بنجاح.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $this->authorize('delete', $category);

        $name = $category->name;
        $restaurant = $category->restaurant;

        $category->delete();

        AuditLog::log(
            action: 'category.deleted',
            description: "حذف قسم '{$name}' وجميع الأصناف التابعة له",
            restaurant: $restaurant
        );

        return back()->with('success', "تم حذف قسم '{$name}' بنجاح.");
    }

    public function reorder(Request $request): RedirectResponse
    {
        $restaurant = $request->user()->restaurant;

        $request->validate([
            'orders' => ['required', 'array'],
            'orders.*.id' => ['required', 'integer'],
            'orders.*.order' => ['required', 'integer'],
        ]);

        foreach ($request->orders as $item) {
            $restaurant->categories()
                ->where('id', $item['id'])
                ->update(['display_order' => $item['order']]);
        }

        return back()->with('success', 'تم تحديث ترتيب الأقسام بنجاح.');
    }
}
