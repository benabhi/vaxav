<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Skill extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'skill_category_id',
        'name',
        'description',
        'multiplier',
    ];

    /**
     * Get the category that owns the skill.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(SkillCategory::class, 'skill_category_id');
    }

    /**
     * Get the prerequisites for this skill.
     */
    public function prerequisites(): BelongsToMany
    {
        return $this->belongsToMany(
            Skill::class,
            'skills_prerequisites',
            'skill_id',
            'prerequisite_id'
        )->withPivot('prerequisite_level');
    }

    /**
     * Get the skills that have this skill as a prerequisite.
     */
    public function requiredFor(): BelongsToMany
    {
        return $this->belongsToMany(
            Skill::class,
            'skills_prerequisites',
            'prerequisite_id',
            'skill_id'
        );
    }

    /**
     * Get the pilots that have this skill.
     */
    public function pilots(): BelongsToMany
    {
        return $this->belongsToMany(
            Pilot::class,
            'pilots_skills',
            'skill_id',
            'pilot_id'
        )->withPivot('xp', 'current_level', 'active');
    }
}
