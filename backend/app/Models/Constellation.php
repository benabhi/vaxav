<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Constellation extends Model
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
        'region_id',
        'coordinates_x',
        'coordinates_y',
    ];

    /**
     * Get the region that owns the constellation.
     */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Get the solar systems in this constellation.
     */
    public function solarSystems(): HasMany
    {
        return $this->hasMany(SolarSystem::class);
    }
}
