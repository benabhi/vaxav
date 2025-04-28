<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Corporation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'ticker',
        'description',
        'founder_id',
        'credits',
        'tax_rate',
    ];

    /**
     * Get the pilots that belong to this corporation.
     */
    public function pilots(): HasMany
    {
        return $this->hasMany(Pilot::class);
    }

    /**
     * Get the founder of the corporation.
     */
    public function founder(): BelongsTo
    {
        return $this->belongsTo(Pilot::class, 'founder_id');
    }
}
