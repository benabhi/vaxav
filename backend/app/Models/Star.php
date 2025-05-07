<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Star extends Model
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
        'type',
    ];

    /**
     * Get the solar system that owns the star.
     */
    public function solarSystem(): BelongsTo
    {
        return $this->belongsTo(SolarSystem::class);
    }

    /**
     * Get the planets orbiting this star.
     */
    public function planets(): HasMany
    {
        return $this->hasMany(Planet::class);
    }
}
