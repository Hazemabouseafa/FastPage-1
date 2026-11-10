<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuItemAndCategoryTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private Restaurant $restaurant;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::factory()->create();
        $this->restaurant = Restaurant::create([
            'user_id' => $this->owner->id,
            'name' => 'كشري النيل',
            'slug' => 'koshary-nile',
            'whatsapp_number' => '01012345678',
            'is_published' => true,
        ]);
        $this->category = Category::create([
            'restaurant_id' => $this->restaurant->id,
            'name' => 'وجبات رئيسية',
            'display_order' => 1,
        ]);
    }

    public function test_owner_can_create_category(): void
    {
        $response = $this->actingAs($this->owner)->post(route('categories.store'), [
            'name' => 'طواجن جديدة',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('categories', [
            'restaurant_id' => $this->restaurant->id,
            'name' => 'طواجن جديدة',
        ]);
    }

    public function test_owner_can_update_category(): void
    {
        $response = $this->actingAs($this->owner)->put(route('categories.update', $this->category->id), [
            'name' => 'أطباق رئيسية معدلة',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame('أطباق رئيسية معدلة', $this->category->fresh()->name);
    }

    public function test_owner_can_delete_category(): void
    {
        $response = $this->actingAs($this->owner)->delete(route('categories.destroy', $this->category->id));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('categories', ['id' => $this->category->id]);
    }

    public function test_owner_can_create_menu_item(): void
    {
        $response = $this->actingAs($this->owner)->post(route('items.store'), [
            'category_id' => $this->category->id,
            'name' => 'كشري سوبر دبل',
            'description' => 'أرز وعدس ومكرونة مع تقلية مقرمشة',
            'price' => '65.50',
            'is_available' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('menu_items', [
            'restaurant_id' => $this->restaurant->id,
            'category_id' => $this->category->id,
            'name' => 'كشري سوبر دبل',
            'price' => '65.50',
            'is_available' => true,
        ]);
    }

    public function test_owner_can_toggle_menu_item_availability_instantly(): void
    {
        $item = MenuItem::create([
            'restaurant_id' => $this->restaurant->id,
            'category_id' => $this->category->id,
            'name' => 'طاجن لحمة مفرومة',
            'price' => '55.00',
            'is_available' => true,
        ]);

        // Toggle to unavailable
        $response1 = $this->actingAs($this->owner)->post(route('items.toggle_availability', $item->id));
        $response1->assertSessionHasNoErrors();
        $this->assertFalse($item->fresh()->is_available);

        // Toggle back to available
        $response2 = $this->actingAs($this->owner)->post(route('items.toggle_availability', $item->id));
        $response2->assertSessionHasNoErrors();
        $this->assertTrue($item->fresh()->is_available);
    }

    public function test_owner_can_toggle_restaurant_publish_state(): void
    {
        $this->assertTrue($this->restaurant->is_published);

        $response = $this->actingAs($this->owner)->post(route('restaurant.toggle_publish'));
        $response->assertSessionHasNoErrors();
        $this->assertFalse($this->restaurant->fresh()->is_published);

        $response2 = $this->actingAs($this->owner)->post(route('restaurant.toggle_publish'));
        $response2->assertSessionHasNoErrors();
        $this->assertTrue($this->restaurant->fresh()->is_published);
    }
}
