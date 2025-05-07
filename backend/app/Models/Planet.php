<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Planet extends Model
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
        'star_id',
        'type',
        'orbit_position',
    ];

    /**
     * Get the star that owns the planet.
     */
    public function star(): BelongsTo
    {
        return $this->belongsTo(Star::class);
    }
}
