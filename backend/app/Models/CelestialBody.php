<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CelestialBody extends Model
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
        'solar_system_id',
        'celestial_type_id',
        'parent_id',
        'orbit_index',
        'coordinates_x',
        'coordinates_y',
    ];

    /**
     * Get the solar system that owns the celestial body.
     */
    public function solarSystem(): BelongsTo
    {
        return $this->belongsTo(SolarSystem::class);
    }

    /**
     * Get the type of this celestial body.
     */
    public function celestialType(): BelongsTo
    {
        return $this->belongsTo(CelestialType::class);
    }

    /**
     * Get the parent celestial body (if any).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(CelestialBody::class, 'parent_id');
    }

    /**
     * Get the celestial bodies that orbit this one.
     */
    public function satellites(): HasMany
    {
        return $this->hasMany(CelestialBody::class, 'parent_id');
    }

    /**
     * Scope a query to only include celestial bodies of a specific type.
     */
    public function scopeOfType($query, $typeName)
    {
        return $query->whereHas('celestialType', function ($query) use ($typeName) {
            $query->where('name', $typeName);
        });
    }

    /**
     * Scope a query to only include stars.
     */
    public function scopeStars($query)
    {
        return $this->scopeOfType($query, 'star');
    }

    /**
     * Scope a query to only include planets.
     */
    public function scopePlanets($query)
    {
        return $this->scopeOfType($query, 'planet');
    }

    /**
     * Scope a query to only include moons.
     */
    public function scopeMoons($query)
    {
        return $this->scopeOfType($query, 'moon');
    }
}
