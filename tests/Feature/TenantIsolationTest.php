<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private User $ownerA;
    private Restaurant $restaurantA;
    private Category $categoryA;
    private MenuItem $itemA;

    private User $ownerB;
    private Restaurant $restaurantB;
    private Category $categoryB;
    private MenuItem $itemB;

    protected function setUp(): void
    {
        parent::setUp();

        // Restaurant A
        $this->ownerA = User::factory()->create();
        $this->restaurantA = Restaurant::create([
            'user_id' => $this->ownerA->id,
            'name' => 'مطعم ألف',
            'slug' => 'restaurant-a',
            'whatsapp_number' => '01011111111',
        ]);
        $this->categoryA = Category::create([
            'restaurant_id' => $this->restaurantA->id,
            'name' => 'قسم أ',
            'display_order' => 1,
        ]);
        $this->itemA = MenuItem::create([
            'restaurant_id' => $this->restaurantA->id,
            'category_id' => $this->categoryA->id,
            'name' => 'صنف أ',
            'price' => 50.00,
            'is_available' => true,
        ]);

        // Restaurant B
        $this->ownerB = User::factory()->create();
        $this->restaurantB = Restaurant::create([
            'user_id' => $this->ownerB->id,
            'name' => 'مطعم باء',
            'slug' => 'restaurant-b',
            'whatsapp_number' => '01022222222',
        ]);
        $this->categoryB = Category::create([
            'restaurant_id' => $this->restaurantB->id,
            'name' => 'قسم ب',
            'display_order' => 1,
        ]);
        $this->itemB = MenuItem::create([
            'restaurant_id' => $this->restaurantB->id,
            'category_id' => $this->categoryB->id,
            'name' => 'صنف ب',
            'price' => 80.00,
            'is_available' => true,
        ]);
    }

    public function test_owner_a_cannot_update_category_of_owner_b(): void
    {
        $response = $this->actingAs($this->ownerA)->put(route('categories.update', $this->categoryB->id), [
            'name' => 'محاولة اختراق القسم',
        ]);

        $response->assertForbidden();
        $this->assertSame('قسم ب', $this->categoryB->fresh()->name);
    }

    public function test_owner_a_cannot_delete_category_of_owner_b(): void
    {
        $response = $this->actingAs($this->ownerA)->delete(route('categories.destroy', $this->categoryB->id));

        $response->assertForbidden();
        $this->assertDatabaseHas('categories', ['id' => $this->categoryB->id]);
    }

    public function test_owner_a_cannot_update_menu_item_of_owner_b(): void
    {
        $response = $this->actingAs($this->ownerA)->post(route('items.update', $this->itemB->id), [
            'category_id' => $this->categoryB->id,
            'name' => 'صنف مسروق',
            'price' => 10.00,
        ]);

        $response->assertForbidden();
        $this->assertSame('صنف ب', $this->itemB->fresh()->name);
    }

    public function test_owner_a_cannot_toggle_availability_of_owner_b_item(): void
    {
        $response = $this->actingAs($this->ownerA)->post(route('items.toggle_availability', $this->itemB->id));

        $response->assertForbidden();
        $this->assertTrue($this->itemB->fresh()->is_available);
    }

    public function test_owner_a_cannot_delete_menu_item_of_owner_b(): void
    {
        $response = $this->actingAs($this->ownerA)->delete(route('items.destroy', $this->itemB->id));

        $response->assertForbidden();
        $this->assertDatabaseHas('menu_items', ['id' => $this->itemB->id]);
    }

    public function test_owner_a_cannot_assign_item_to_owner_b_category(): void
    {
        // Try creating an item in Owner A's restaurant using Owner B's category_id
        $response = $this->actingAs($this->ownerA)->post(route('items.store'), [
            'category_id' => $this->categoryB->id, // belongs to Restaurant B
            'name' => 'صنف مشبوه',
            'price' => 40.00,
        ]);

        $response->assertSessionHasErrors('category_id');
        $this->assertDatabaseMissing('menu_items', ['name' => 'صنف مشبوه']);
    }
}
