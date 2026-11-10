<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    /**
     * Determine whether the user can modify or delete the category.
     */
    public function update(User $user, Category $category): bool
    {
        return $user->isSuperAdmin() || ($user->restaurant && $category->restaurant_id === $user->restaurant->id);
    }

    public function delete(User $user, Category $category): bool
    {
        return $this->update($user, $category);
    }
}
