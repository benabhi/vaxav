<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ship extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'ship_type_id',
        'pilot_id',
        'health',
        'shield',
        'armor',
        'cargo_capacity',
        'cargo_used',
    ];

    /**
     * Get the pilot that owns the ship.
     */
    public function pilot(): BelongsTo
    {
        return $this->belongsTo(Pilot::class);
    }

    /**
     * Get the ship type.
     */
    public function shipType(): BelongsTo
    {
        return $this->belongsTo(ShipType::class);
    }

    /**
     * Get the modules installed on this ship.
     */
    public function modules(): HasMany
    {
        return $this->hasMany(ShipModule::class);
    }
}
