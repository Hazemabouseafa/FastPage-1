<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;

class Restaurant extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'whatsapp_number',
        'phone_number',
        'logo_path',
        'cover_path',
        'brand_color',
        'description',
        'currency',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class)->orderBy('display_order');
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class)->orderBy('display_order');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class)->orderByDesc('id');
    }

    public function latestSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class)->orderByDesc('id');
    }

    /**
     * Check if restaurant has an active subscription.
     */
    public function hasActiveSubscription(): bool
    {
        $sub = $this->latestSubscription;
        return $sub ? $sub->isActive() : false;
    }

    /**
     * Check if public menu can be viewed (must be published AND subscription active).
     */
    public function isPubliclyAccessible(): bool
    {
        return $this->is_published && $this->hasActiveSubscription();
    }

    public function getSubscriptionStatusAttribute(): string
    {
        $sub = $this->latestSubscription;
        return $sub ? $sub->effective_status : 'none';
    }

    public function getDaysRemainingAttribute(): int
    {
        $sub = $this->latestSubscription;
        return $sub ? $sub->daysRemaining() : 0;
    }

    public function getPublicUrlAttribute(): string
    {
        return url('/m/' . $this->slug);
    }

    public function getFormattedWhatsappUrlAttribute(): ?string
    {
        if (! $this->whatsapp_number) {
            return null;
        }

        // Clean digits
        $cleaned = preg_replace('/[^0-9]/', '', $this->whatsapp_number);
        if (! str_starts_with($cleaned, '20') && str_starts_with($cleaned, '0')) {
            $cleaned = '2' . $cleaned; // Egypt country code format
        }

        return 'https://wa.me/' . $cleaned;
    }

    public function getLogoUrlAttribute(): ?string
    {
        if (! $this->logo_path) {
            return null;
        }

        return Storage::disk('public')->url($this->logo_path);
    }

    public function getCoverUrlAttribute(): ?string
    {
        if (! $this->cover_path) {
            return null;
        }

        return Storage::disk('public')->url($this->cover_path);
    }
}
