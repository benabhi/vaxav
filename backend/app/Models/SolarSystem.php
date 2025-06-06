<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SolarSystem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'constellation_id',
        'x_coord',
        'y_coord',
    ];

    /**
     * Get the constellation that owns the solar system.
     */
    public function constellation(): BelongsTo
    {
        return $this->belongsTo(Constellation::class);
    }

    /**
     * Get the stars in this solar system.
     */
    public function stars(): HasMany
    {
        return $this->hasMany(Star::class);
    }

    /**
     * Get the stations in this solar system.
     */
    public function stations(): HasMany
    {
        return $this->hasMany(Station::class);
    }

    /**
     * Get the pilots currently in this solar system.
     */
    public function pilots(): HasMany
    {
        return $this->hasMany(Pilot::class, 'location_id');
    }
}
