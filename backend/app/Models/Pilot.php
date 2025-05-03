<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pilot extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'race',
        'user_id',
        'corporation_id',
        'credits',
        'location_id',
    ];

    /**
     * Get the user that owns the pilot.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the corporation that the pilot belongs to.
     */
    public function corporation(): BelongsTo
    {
        return $this->belongsTo(Corporation::class);
    }

    /**
     * Get the ships owned by the pilot.
     */
    public function ships(): HasMany
    {
        return $this->hasMany(Ship::class);
    }

    /**
     * Get the skills of the pilot.
     */
    public function pilotSkills(): HasMany
    {
        return $this->hasMany(PilotSkill::class);
    }

    /**
     * Get the skills that the pilot has.
     */
    public function skills()
    {
        return $this->belongsToMany(
            Skill::class,
            'pilots_skills',
            'pilot_id',
            'skill_id'
        )->withPivot('xp', 'current_level', 'active');
    }

    /**
     * Get the current location of the pilot.
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(SolarSystem::class, 'location_id');
    }
}
