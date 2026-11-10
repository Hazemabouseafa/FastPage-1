<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Restaurant;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $owner;
    private Restaurant $restaurant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => User::ROLE_SUPERADMIN,
        ]);

        $this->owner = User::factory()->create([
            'role' => User::ROLE_OWNER,
        ]);

        $this->restaurant = Restaurant::create([
            'user_id' => $this->owner->id,
            'name' => 'مطعم الأهرام',
            'slug' => 'alahram',
            'whatsapp_number' => '01012345678',
            'is_published' => true,
        ]);
    }

    public function test_owner_is_forbidden_from_admin_dashboard(): void
    {
        $response = $this->actingAs($this->owner)->get(route('admin.dashboard'));

        $response->assertForbidden();
    }

    public function test_super_admin_can_access_admin_dashboard(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Index')
                ->has('restaurants')
                ->has('stats')
        );
    }

    public function test_super_admin_can_activate_subscription(): void
    {
        Subscription::create([
            'restaurant_id' => $this->restaurant->id,
            'status' => Subscription::STATUS_PENDING,
            'price_paid' => 300.00,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.restaurants.activate', $this->restaurant->id));

        $response->assertSessionHasNoErrors();

        $latestSub = $this->restaurant->latestSubscription;
        $this->assertSame(Subscription::STATUS_ACTIVE, $latestSub->status);
        $this->assertSame(300.00, (float) $latestSub->price_paid);
        $this->assertSame($this->admin->id, $latestSub->renewed_by_user_id);
        $this->assertTrue($this->restaurant->fresh()->hasActiveSubscription());

        // Verify audit log
        $this->assertDatabaseHas('audit_logs', [
            'restaurant_id' => $this->restaurant->id,
            'action' => 'subscription.activated',
        ]);
    }

    public function test_super_admin_can_renew_subscription_adding_365_days(): void
    {
        // Existing active subscription expiring in 50 days
        $initialEndsAt = now()->addDays(50);
        Subscription::create([
            'restaurant_id' => $this->restaurant->id,
            'status' => Subscription::STATUS_ACTIVE,
            'starts_at' => now()->subDays(315),
            'ends_at' => $initialEndsAt,
            'price_paid' => 300.00,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.restaurants.renew', $this->restaurant->id));
        $response->assertSessionHasNoErrors();

        $latestSub = $this->restaurant->latestSubscription;
        $this->assertSame(Subscription::STATUS_ACTIVE, $latestSub->status);
        // Ends at should be extended by 365 days from initialEndsAt
        $expectedDays = 50 + 365;
        $actualDays = (int) now()->diffInDays($latestSub->ends_at);
        $this->assertEqualsWithDelta($expectedDays, $actualDays, 2);

        $this->assertDatabaseHas('audit_logs', [
            'restaurant_id' => $this->restaurant->id,
            'action' => 'subscription.renewed',
        ]);
    }

    public function test_super_admin_can_suspend_and_unsuspend_restaurant(): void
    {
        Subscription::create([
            'restaurant_id' => $this->restaurant->id,
            'status' => Subscription::STATUS_ACTIVE,
            'starts_at' => now(),
            'ends_at' => now()->addDays(300),
            'price_paid' => 300.00,
        ]);

        // Suspend
        $response1 = $this->actingAs($this->admin)->post(route('admin.restaurants.suspend', $this->restaurant->id));
        $response1->assertSessionHasNoErrors();
        $this->assertSame(Subscription::STATUS_SUSPENDED, $this->restaurant->fresh()->subscription_status);
        $this->assertFalse($this->restaurant->fresh()->hasActiveSubscription());

        // Unsuspend
        $response2 = $this->actingAs($this->admin)->post(route('admin.restaurants.unsuspend', $this->restaurant->id));
        $response2->assertSessionHasNoErrors();
        $this->assertSame(Subscription::STATUS_ACTIVE, $this->restaurant->fresh()->subscription_status);
        $this->assertTrue($this->restaurant->fresh()->hasActiveSubscription());
    }

    public function test_super_admin_can_delete_restaurant(): void
    {
        $response = $this->actingAs($this->admin)->delete(route('admin.restaurants.destroy', $this->restaurant->id));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('restaurants', ['id' => $this->restaurant->id]);
    }

    public function test_super_admin_can_login_with_custom_identifier_and_redirects_to_long_path(): void
    {
        $hazem = User::create([
            'name' => 'حازم - FastPage Admin',
            'email' => 'admin@hazem',
            'phone' => '01000000000',
            'role' => User::ROLE_SUPERADMIN,
            'password' => bcrypt('bhgihbhggi33M@'),
            'email_verified_at' => now(),
        ]);

        $response = $this->post(route('login'), [
            'email' => 'admin@hazem',
            'password' => 'bhgihbhggi33M@',
        ]);

        $this->assertAuthenticatedAs($hazem);
        $response->assertRedirect(route('admin.dashboard'));
        $this->assertStringContainsString('fastpage-secure-superadmin-control-center', route('admin.dashboard'));
    }

    public function test_traditional_admin_route_is_guarded(): void
    {
        // Guest visiting /admin gets 404
        $this->get('/admin')->assertNotFound();

        // Owner visiting /admin gets 404
        $this->actingAs($this->owner)->get('/admin')->assertNotFound();

        // Superadmin visiting /admin redirects to secret long path
        $this->actingAs($this->admin)->get('/admin')->assertRedirect(route('admin.dashboard'));
    }

    public function test_super_admin_can_update_annual_subscription_price(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.pricing.update'), [
            'annual_price' => 450,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame(450.0, (float) \App\Models\SystemSetting::get('annual_subscription_price'));

        // Verify audit log
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'settings.pricing_updated',
        ]);

        // Next activation should use the new price
        $newOwner = User::factory()->create(['role' => User::ROLE_OWNER]);
        $newRestaurant = Restaurant::create([
            'user_id' => $newOwner->id,
            'name' => 'مطعم الزهور',
            'slug' => 'al-zohour',
            'whatsapp_number' => '01099999999',
            'is_published' => true,
        ]);

        $this->actingAs($this->admin)->post(route('admin.restaurants.activate', $newRestaurant->id));
        $this->assertSame(450.0, (float) $newRestaurant->latestSubscription->price_paid);
    }

    public function test_owner_cannot_update_pricing(): void
    {
        $response = $this->actingAs($this->owner)->post(route('admin.pricing.update'), [
            'annual_price' => 50,
        ]);

        $response->assertForbidden();
    }

    public function test_super_admin_can_sync_and_export_customer_data_in_persistent_storage(): void
    {
        // 1. Sync
        $syncResponse = $this->actingAs($this->admin)->post(route('admin.customers.sync'));
        $syncResponse->assertSessionHasNoErrors();

        $jsonPath = \App\Services\PersistentCustomerDataService::getJsonFilePath();
        $csvPath = \App\Services\PersistentCustomerDataService::getCsvFilePath();

        $this->assertFileExists($jsonPath);
        $this->assertFileExists($csvPath);

        $jsonContent = file_get_contents($jsonPath);
        $this->assertStringContainsString('مطعم الأهرام', $jsonContent);
        $this->assertStringContainsString('FastPage SaaS', $jsonContent);

        // 2. Export JSON
        $exportJsonResponse = $this->actingAs($this->admin)->get(route('admin.customers.export', ['format' => 'json']));
        $exportJsonResponse->assertOk();
        $exportJsonResponse->assertHeader('content-type', 'application/json; charset=UTF-8');

        // 3. Export CSV
        $exportCsvResponse = $this->actingAs($this->admin)->get(route('admin.customers.export', ['format' => 'csv']));
        $exportCsvResponse->assertOk();
        $exportCsvResponse->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_artisan_sync_customer_data_command(): void
    {
        $this->artisan('saas:sync-customers')
            ->assertExitCode(0);
    }
}
