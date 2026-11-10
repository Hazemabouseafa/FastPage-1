<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_GRACE = 'grace';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_SUSPENDED = 'suspended';

    protected $fillable = [
        'restaurant_id',
        'status',
        'starts_at',
        'ends_at',
        'price_paid',
        'notes',
        'renewed_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'price_paid' => 'decimal:2',
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function renewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'renewed_by_user_id');
    }

    /**
     * Compute subscription live status including automatic grace/expired transitions.
     */
    public function getEffectiveStatusAttribute(): string
    {
        if ($this->status === self::STATUS_SUSPENDED) {
            return self::STATUS_SUSPENDED;
        }

        if ($this->status === self::STATUS_PENDING) {
            return self::STATUS_PENDING;
        }

        if (! $this->ends_at) {
            return $this->status;
        }

        $now = Carbon::now();
        $graceDays = config('saas.grace_period_days', 7);
        $graceDeadline = $this->ends_at->copy()->addDays($graceDays);

        if ($now->lessThanOrEqualTo($this->ends_at)) {
            return self::STATUS_ACTIVE;
        }

        if ($now->lessThanOrEqualTo($graceDeadline)) {
            return self::STATUS_GRACE;
        }

        return self::STATUS_EXPIRED;
    }

    public function isActive(): bool
    {
        $status = $this->effective_status;
        return $status === self::STATUS_ACTIVE || $status === self::STATUS_GRACE;
    }

    public function isExpired(): bool
    {
        return $this->effective_status === self::STATUS_EXPIRED;
    }

    public function isSuspended(): bool
    {
        return $this->status === self::STATUS_SUSPENDED;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function daysRemaining(): int
    {
        if (! $this->ends_at) {
            return 0;
        }

        $diff = Carbon::now()->diffInDays($this->ends_at, false);
        return (int) max(0, $diff);
    }
}
