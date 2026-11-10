<?php

namespace App\Policies;

use App\Models\MenuItem;
use App\Models\User;

class MenuItemPolicy
{
    /**
     * Determine whether the user can modify or delete the menu item.
     */
    public function update(User $user, MenuItem $menuItem): bool
    {
        return $user->isSuperAdmin() || ($user->restaurant && $menuItem->restaurant_id === $user->restaurant->id);
    }

    public function delete(User $user, MenuItem $menuItem): bool
    {
        return $this->update($user, $menuItem);
    }
}
