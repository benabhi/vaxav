<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SkillPrerequisite extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'skills_prerequisites';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'skill_id',
        'prerequisite_id',
        'prerequisite_level',
    ];

    /**
     * Get the skill that has the prerequisite.
     */
    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class, 'skill_id');
    }

    /**
     * Get the prerequisite skill.
     */
    public function prerequisite(): BelongsTo
    {
        return $this->belongsTo(Skill::class, 'prerequisite_id');
    }
}
