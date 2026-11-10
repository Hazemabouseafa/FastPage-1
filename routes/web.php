<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicMenuController;
use App\Http\Controllers\QrController;
use App\Http\Controllers\RestaurantController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Homepage / Landing Page in Arabic
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'demoSlug' => 'koshary-tahrir',
        'annualPrice' => config('saas.annual_price', 300),
    ]);
})->name('home');

// Public Customer Menu (No login, cached, fast)
Route::get('/m/{slug}', [PublicMenuController::class, 'show'])->name('public.menu');
Route::get('/menu/{slug}', [PublicMenuController::class, 'show']); // Friendly alias

// Dynamic QR Code generation (SVG/PNG) & Printable Table Tent
Route::get('/m/{slug}/qr.svg', [QrController::class, 'generateSvg'])->name('restaurant.qr.svg');
Route::get('/m/{slug}/qr.png', [QrController::class, 'generateSvg'])->name('restaurant.qr.png');
Route::get('/m/{slug}/stand', [QrController::class, 'printableStand'])->name('restaurant.qr.stand');

/*
|--------------------------------------------------------------------------
| Onboarding Routes (Auth required, no restaurant yet)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/onboarding', [OnboardingController::class, 'create'])->name('onboarding');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
    Route::get('/onboarding/check-slug', [OnboardingController::class, 'checkSlug'])->name('onboarding.check_slug');
});

/*
|--------------------------------------------------------------------------
| Restaurant Owner Protected Routes (Auth + Has Restaurant)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'has.restaurant'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Restaurant details & publish toggle
    Route::post('/dashboard/restaurant', [RestaurantController::class, 'update'])->name('restaurant.update');
    Route::post('/dashboard/restaurant/toggle-publish', [RestaurantController::class, 'togglePublish'])->name('restaurant.toggle_publish');

    // Categories CRUD
    Route::post('/dashboard/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/dashboard/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/dashboard/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    Route::post('/dashboard/categories/reorder', [CategoryController::class, 'reorder'])->name('categories.reorder');

    // Menu Items CRUD & Quick Toggle
    Route::post('/dashboard/items', [MenuItemController::class, 'store'])->name('items.store');
    Route::post('/dashboard/items/{menuItem}', [MenuItemController::class, 'update'])->name('items.update');
    Route::delete('/dashboard/items/{menuItem}', [MenuItemController::class, 'destroy'])->name('items.destroy');
    Route::post('/dashboard/items/{menuItem}/toggle-availability', [MenuItemController::class, 'toggleAvailability'])->name('items.toggle_availability');
});

/*
|--------------------------------------------------------------------------
| Profile Routes (Auth required)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Super Admin Protected Routes (Auth + SuperAdmin Role)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::post('/restaurants/{restaurant}/activate', [AdminController::class, 'activateSubscription'])->name('admin.restaurants.activate');
    Route::post('/restaurants/{restaurant}/renew', [AdminController::class, 'renewSubscription'])->name('admin.restaurants.renew');
    Route::post('/restaurants/{restaurant}/suspend', [AdminController::class, 'suspendSubscription'])->name('admin.restaurants.suspend');
    Route::post('/restaurants/{restaurant}/unsuspend', [AdminController::class, 'unsuspendSubscription'])->name('admin.restaurants.unsuspend');
    Route::delete('/restaurants/{restaurant}', [AdminController::class, 'destroyRestaurant'])->name('admin.restaurants.destroy');
});

require __DIR__.'/auth.php';
