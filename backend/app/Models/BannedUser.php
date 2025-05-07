<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BannedUser extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'banned_by',
        'reason',
        'notes',
        'type',
        'expires_at',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that was banned.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who banned the user.
     */
    public function bannedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'banned_by');
    }

    /**
     * Check if the ban is permanent.
     */
    public function isPermanent(): bool
    {
        return $this->type === 'permanent';
    }

    /**
     * Check if the ban is temporary.
     */
    public function isTemporary(): bool
    {
        return $this->type === 'temporary';
    }

    /**
     * Check if the ban is active.
     */
    public function isActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        // If it's a temporary ban, check if it has expired
        if ($this->isTemporary() && $this->expires_at !== null) {
            return $this->expires_at->isFuture();
        }

        // Permanent bans or temporary bans with no expiration date are always active
        return true;
    }
}
