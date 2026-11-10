<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Request;

class AuditLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'restaurant_id',
        'action',
        'description',
        'ip_address',
        'payload',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    /**
     * Helper to quickly log an action
     */
    public static function log(
        string $action,
        ?string $description = null,
        ?Restaurant $restaurant = null,
        ?array $payload = null,
        ?User $user = null
    ): self {
        $user = $user ?? auth()->user();
        $restaurantId = $restaurant?->id ?? ($user && $user->restaurant ? $user->restaurant->id : null);

        return self::create([
            'user_id' => $user?->id,
            'restaurant_id' => $restaurantId,
            'action' => $action,
            'description' => $description,
            'ip_address' => Request::ip(),
            'payload' => $payload,
            'created_at' => now(),
        ]);
    }
}
