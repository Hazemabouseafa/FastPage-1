<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicMenuTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private Restaurant $restaurant;
    private Subscription $subscription;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::factory()->create();
        $this->restaurant = Restaurant::create([
            'user_id' => $this->owner->id,
            'name' => 'كشري الزعيم',
            'slug' => 'alzaeem',
            'whatsapp_number' => '01012345678',
            'is_published' => true,
        ]);

        $this->subscription = Subscription::create([
            'restaurant_id' => $this->restaurant->id,
            'status' => Subscription::STATUS_ACTIVE,
            'starts_at' => now(),
            'ends_at' => now()->addDays(365),
            'price_paid' => 300.00,
        ]);

        $cat = Category::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'علب الكشري',
            'display_order' => 1,
        ]);

        MenuItem::create([
            'restaurant_id' => $this->restaurant->id,
            'category_id' => $cat->id,
            'name' => 'علبة كشري عادي',
            'price' => 30.00,
            'is_available' => true,
        ]);
    }

    public function test_public_menu_accessible_without_login_when_published_and_active(): void
    {
        $response = $this->get('/m/alzaeem');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('PublicMenu/Show')
                ->has('restaurant')
                ->where('restaurant.name', 'كشري الزعيم')
                ->has('categories')
        );
    }

    public function test_public_menu_alias_works(): void
    {
        $response = $this->get('/menu/alzaeem');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('PublicMenu/Show'));
    }

    public function test_public_menu_shows_unavailable_when_unpublished(): void
    {
        $this->restaurant->update(['is_published' => false]);

        $response = $this->get('/m/alzaeem');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('PublicMenu/Unavailable')
                ->where('reason', 'draft')
        );
    }

    public function test_public_menu_shows_unavailable_when_subscription_is_expired(): void
    {
        $this->subscription->update([
            'status' => Subscription::STATUS_EXPIRED,
            'ends_at' => now()->subDays(30),
        ]);

        $response = $this->get('/m/alzaeem');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('PublicMenu/Unavailable')
                ->where('reason', 'subscription_expired')
        );
    }

    public function test_public_menu_shows_unavailable_when_subscription_is_suspended(): void
    {
        $this->subscription->update([
            'status' => Subscription::STATUS_SUSPENDED,
        ]);

        $response = $this->get('/m/alzaeem');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('PublicMenu/Unavailable')
                ->where('reason', 'subscription_expired')
        );
    }

    public function test_public_menu_shows_not_found_when_slug_does_not_exist(): void
    {
        $response = $this->get('/m/non-existent-restaurant-slug');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('PublicMenu/NotFound')
        );
    }

    public function test_qr_code_svg_generation(): void
    {
        $response = $this->get('/m/alzaeem/qr.svg');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'image/svg+xml');
        $this->assertStringContainsString('<svg', $response->getContent());
    }

    public function test_printable_table_tent_stand_view(): void
    {
        $response = $this->get('/m/alzaeem/stand');

        $response->assertStatus(200);
        $this->assertStringContainsString('كشري الزعيم', $response->getContent());
        $this->assertStringContainsString('امسح الرمز', $response->getContent());
    }
}
