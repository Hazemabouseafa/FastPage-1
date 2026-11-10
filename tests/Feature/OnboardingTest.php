<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    public function test_onboarding_screen_can_be_rendered(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/onboarding');

        $response->assertStatus(200);
    }

    public function test_user_with_restaurant_is_redirected_away_from_onboarding(): void
    {
        $user = User::factory()->create();
        Restaurant::create([
            'user_id' => $user->id,
            'name' => 'مطعم موجود',
            'slug' => 'existing-restaurant',
            'whatsapp_number' => '01012345678',
        ]);

        $response = $this->actingAs($user)->get('/onboarding');

        $response->assertRedirect(route('dashboard'));
    }

    public function test_slug_availability_check_api(): void
    {
        $user = User::factory()->create();
        Restaurant::create([
            'user_id' => $user->id,
            'name' => 'كشري الزعيم',
            'slug' => 'alzaeem',
            'whatsapp_number' => '01012345678',
        ]);

        $takenRes = $this->actingAs($user)->getJson('/onboarding/check-slug?slug=alzaeem');
        $takenRes->assertOk()->assertJson(['available' => false]);

        $freeRes = $this->actingAs($user)->getJson('/onboarding/check-slug?slug=new-koshary');
        $freeRes->assertOk()->assertJson(['available' => true]);
    }

    public function test_user_can_complete_onboarding(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/onboarding', [
            'name' => 'كشري أبو طارق',
            'slug' => 'abu-tarek',
            'whatsapp_number' => '01099998888',
            'phone_number' => '0225789000',
            'brand_color' => '#ea580c',
            'description' => 'أشهر كشري في وسط البلد',
        ]);

        $response->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('restaurants', [
            'user_id' => $user->id,
            'name' => 'كشري أبو طارق',
            'slug' => 'abu-tarek',
            'whatsapp_number' => '01099998888',
            'is_published' => false,
        ]);

        $restaurant = Restaurant::where('slug', 'abu-tarek')->first();
        $this->assertNotNull($restaurant);

        // Verify pending subscription created with 300 EGP
        $this->assertDatabaseHas('subscriptions', [
            'restaurant_id' => $restaurant->id,
            'status' => Subscription::STATUS_PENDING,
            'price_paid' => 300.00,
        ]);

        // Verify default categories created
        $this->assertGreaterThanOrEqual(3, $restaurant->categories()->count());
    }
}
