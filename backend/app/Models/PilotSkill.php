<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PilotSkill extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'pilots_skills';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'pilot_id',
        'skill_id',
        'xp',
        'current_level',
        'active',
    ];

    /**
     * Get the pilot that owns the skill.
     */
    public function pilot(): BelongsTo
    {
        return $this->belongsTo(Pilot::class);
    }

    /**
     * Get the skill that the pilot has.
     */
    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class);
    }
}
