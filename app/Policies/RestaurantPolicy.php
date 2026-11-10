<?php

namespace App\Policies;

use App\Models\Restaurant;
use App\Models\User;

class RestaurantPolicy
{
    /**
     * Determine whether the user can view or update the restaurant.
     */
    public function update(User $user, Restaurant $restaurant): bool
    {
        return $user->isSuperAdmin() || $restaurant->user_id === $user->id;
    }

    public function delete(User $user, Restaurant $restaurant): bool
    {
        return $user->isSuperAdmin();
    }
}
