<?php

namespace Tests\Unit;

use App\Models\Pilot;
use App\Models\PilotSkill;
use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\SkillPrerequisite;
use App\Models\SolarSystem;
use App\Models\User;
use App\Services\SkillService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SkillServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $skillService;
    protected $pilot;
    protected $basicSkill;
    protected $advancedSkill;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skillService = new SkillService();

        // Crear un sistema solar para la ubicación inicial
        $solarSystem = SolarSystem::create([
            'name'           => 'Sol',
            'description'    => 'Sistema solar de la Tierra',
            'security_level' => 1.0,
            'x_coordinate'   => 0,
            'y_coordinate'   => 0,
        ]);

        // Crear un usuario y un piloto
        $user = User::factory()->create();
        $this->pilot = Pilot::create([
            'name'        => 'Test Pilot',
            'race'        => 'Humano',
            'user_id'     => $user->id,
            'credits'     => 10000,
            'location_id' => $solarSystem->id,
        ]);

        // Crear categoría de habilidades
        $category = SkillCategory::create([
            'name'        => 'Combate',
            'description' => 'Habilidades de combate',
        ]);

        // Crear habilidades
        $this->basicSkill = Skill::create([
            'name'              => 'Armas Láser Básicas',
            'description'       => 'Conocimientos básicos sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 1,
        ]);

        $this->advancedSkill = Skill::create([
            'name'              => 'Armas Láser Avanzadas',
            'description'       => 'Conocimientos avanzados sobre el uso de armas láser.',
            'skill_category_id' => $category->id,
            'multiplier'        => 2,
        ]);

        // Crear prerrequisito: Armas Láser Avanzadas requiere Armas Láser Básicas nivel 3
        SkillPrerequisite::create([
            'skill_id'           => $this->advancedSkill->id,
            'prerequisite_id'    => $this->basicSkill->id,
            'prerequisite_level' => 3,
        ]);
    }

    /** @test */
    public function can_get_xp_requirements()
    {
        $xpRequirements = $this->skillService->getXpRequirements();

        $this->assertIsArray($xpRequirements);
        $this->assertCount(5, $xpRequirements);
        $this->assertEquals(50, $xpRequirements[0]);
        $this->assertEquals(150, $xpRequirements[1]);
        $this->assertEquals(300, $xpRequirements[2]);
        $this->assertEquals(600, $xpRequirements[3]);
        $this->assertEquals(1000, $xpRequirements[4]);
    }

    /** @test */
    public function can_get_min_xp_for_level()
    {
        // Sin multiplicador
        $this->assertEquals(0, $this->skillService->getMinXpForLevel(0));
        $this->assertEquals(50, $this->skillService->getMinXpForLevel(1));
        $this->assertEquals(200, $this->skillService->getMinXpForLevel(2));
        $this->assertEquals(500, $this->skillService->getMinXpForLevel(3));
        $this->assertEquals(1100, $this->skillService->getMinXpForLevel(4));
        $this->assertEquals(2100, $this->skillService->getMinXpForLevel(5));

        // Con multiplicador 2
        $this->assertEquals(0, $this->skillService->getMinXpForLevel(0, 2.0));
        $this->assertEquals(100, $this->skillService->getMinXpForLevel(1, 2.0));
        $this->assertEquals(400, $this->skillService->getMinXpForLevel(2, 2.0));
        $this->assertEquals(1000, $this->skillService->getMinXpForLevel(3, 2.0));
        $this->assertEquals(2200, $this->skillService->getMinXpForLevel(4, 2.0));
        $this->assertEquals(4200, $this->skillService->getMinXpForLevel(5, 2.0));
    }

    /** @test */
    public function can_calculate_level_from_xp()
    {
        // Sin multiplicador
        $this->assertEquals(0, $this->skillService->calculateLevelFromXp(0));
        $this->assertEquals(1, $this->skillService->calculateLevelFromXp(50));
        $this->assertEquals(1, $this->skillService->calculateLevelFromXp(199));
        $this->assertEquals(2, $this->skillService->calculateLevelFromXp(200));
        $this->assertEquals(3, $this->skillService->calculateLevelFromXp(500));
        $this->assertEquals(4, $this->skillService->calculateLevelFromXp(1100));
        $this->assertEquals(5, $this->skillService->calculateLevelFromXp(2100));
        $this->assertEquals(5, $this->skillService->calculateLevelFromXp(3000));

        // Con multiplicador 2
        $this->assertEquals(0, $this->skillService->calculateLevelFromXp(0, 2.0));
        $this->assertEquals(1, $this->skillService->calculateLevelFromXp(100, 2.0));
        $this->assertEquals(2, $this->skillService->calculateLevelFromXp(400, 2.0));
        $this->assertEquals(3, $this->skillService->calculateLevelFromXp(1000, 2.0));
        $this->assertEquals(4, $this->skillService->calculateLevelFromXp(2200, 2.0));
        $this->assertEquals(5, $this->skillService->calculateLevelFromXp(4200, 2.0));
    }

    /** @test */
    public function can_get_xp_progress()
    {
        // Nivel 0 con 25 XP (50% del camino al nivel 1)
        $progress = $this->skillService->getXpProgress(25, 0);
        $this->assertEquals(25, $progress['current']);
        $this->assertEquals(50, $progress['required']);
        $this->assertEquals(50, $progress['percentage']);

        // Nivel 1 con 175 XP (50% del camino al nivel 2)
        $progress = $this->skillService->getXpProgress(175, 1);
        $this->assertEquals(125, $progress['current']);
        $this->assertEquals(150, $progress['required']);
        $this->assertEquals(83, $progress['percentage']);

        // Con multiplicador 2
        $progress = $this->skillService->getXpProgress(150, 0, 2.0);
        $this->assertEquals(150, $progress['current']);
        $this->assertEquals(100, $progress['required']);
        $this->assertEquals(100, $progress['percentage']);
    }

    /** @test */
    public function can_activate_skill_without_prerequisites()
    {
        // Asignar la habilidad básica al piloto
        $this->pilot->skills()->attach($this->basicSkill->id, [
            'current_level' => 3,
            'xp'            => 500,
            'active'        => false,
        ]);

        $result = $this->skillService->canActivateSkill($this->pilot, $this->basicSkill);

        $this->assertTrue($result['can_activate']);
        $this->assertEmpty($result['missing_prerequisites']);
    }

    /** @test */
    public function cannot_activate_skill_with_missing_prerequisites()
    {
        // Asignar la habilidad avanzada al piloto sin tener la básica
        $this->pilot->skills()->attach($this->advancedSkill->id, [
            'current_level' => 1,
            'xp'            => 100,
            'active'        => false,
        ]);

        $result = $this->skillService->canActivateSkill($this->pilot, $this->advancedSkill);

        $this->assertFalse($result['can_activate']);
        $this->assertNotEmpty($result['missing_prerequisites']);
        $this->assertEquals($this->basicSkill->id, $result['missing_prerequisites'][0]['skill']->id);
        $this->assertEquals(3, $result['missing_prerequisites'][0]['required_level']);
    }

    /** @test */
    public function cannot_activate_skill_with_insufficient_prerequisite_level()
    {
        // Asignar la habilidad básica al piloto con nivel insuficiente
        $this->pilot->skills()->attach($this->basicSkill->id, [
            'current_level' => 2, // Nivel 2, pero se requiere nivel 3
            'xp'            => 200,
            'active'        => true,
        ]);

        // Asignar la habilidad avanzada al piloto
        $this->pilot->skills()->attach($this->advancedSkill->id, [
            'current_level' => 1,
            'xp'            => 100,
            'active'        => false,
        ]);

        $result = $this->skillService->canActivateSkill($this->pilot, $this->advancedSkill);

        $this->assertFalse($result['can_activate']);
        $this->assertNotEmpty($result['missing_prerequisites']);
        $this->assertEquals($this->basicSkill->id, $result['missing_prerequisites'][0]['skill']->id);
        $this->assertEquals(3, $result['missing_prerequisites'][0]['required_level']);
        $this->assertEquals(2, $result['missing_prerequisites'][0]['current_level']);
    }

    /** @test */
    public function can_activate_skill_with_sufficient_prerequisites()
    {
        // Asignar la habilidad básica al piloto con nivel suficiente
        $this->pilot->skills()->attach($this->basicSkill->id, [
            'current_level' => 4, // Nivel 4, superior al requerido (3)
            'xp'            => 1100,
            'active'        => true,
        ]);

        // Asignar la habilidad avanzada al piloto
        $this->pilot->skills()->attach($this->advancedSkill->id, [
            'current_level' => 1,
            'xp'            => 100,
            'active'        => false,
        ]);

        $result = $this->skillService->canActivateSkill($this->pilot, $this->advancedSkill);

        $this->assertTrue($result['can_activate']);
        $this->assertEmpty($result['missing_prerequisites']);
    }

    /** @test */
    public function can_deactivate_skill_without_dependents()
    {
        // Asignar la habilidad avanzada al piloto
        $this->pilot->skills()->attach($this->advancedSkill->id, [
            'current_level' => 1,
            'xp'            => 100,
            'active'        => true,
        ]);

        $result = $this->skillService->canDeactivateSkill($this->pilot, $this->advancedSkill);

        $this->assertTrue($result['can_deactivate']);
        $this->assertEmpty($result['dependent_skills']);
    }

    /** @test */
    public function cannot_deactivate_skill_with_active_dependents()
    {
        // Asignar la habilidad básica al piloto
        $this->pilot->skills()->attach($this->basicSkill->id, [
            'current_level' => 4,
            'xp'            => 1100,
            'active'        => true,
        ]);

        // Asignar la habilidad avanzada al piloto (depende de la básica)
        $this->pilot->skills()->attach($this->advancedSkill->id, [
            'current_level' => 2,
            'xp'            => 400,
            'active'        => true,
        ]);

        $result = $this->skillService->canDeactivateSkill($this->pilot, $this->basicSkill);

        $this->assertFalse($result['can_deactivate']);
        $this->assertNotEmpty($result['dependent_skills']);
        $this->assertEquals($this->advancedSkill->id, $result['dependent_skills'][0]['skill']->id);
    }

    /** @test */
    public function can_calculate_progression_index()
    {
        $stats = [
            'totalSkills' => 10,
            'learnedSkills' => 5,
            'activeSkills' => 3,
            'totalXP' => 5000,
            'skillsByLevel' => [
                1 => 2,
                2 => 1,
                3 => 1,
                4 => 1,
            ],
            'multiplierStats' => [
                1 => 3,
                2 => 2,
            ],
        ];

        $result = $this->skillService->calculateProgressionIndex($stats);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('progressionIndex', $result);
        $this->assertArrayHasKey('progressionComponents', $result);
        $this->assertIsNumeric($result['progressionIndex']);

        // Verificar componentes
        $components = $result['progressionComponents'];
        $this->assertEquals(50, $components['HS']); // 5/10 * 100
        $this->assertEquals(2.2, $components['AL']); // (2*1 + 1*2 + 1*3 + 1*4) / 5 = 11/5 = 2.2
        $this->assertEquals(5000, $components['XP']);
        $this->assertEquals(60, $components['AS']); // 3/5 * 100
        $this->assertEquals(1.4, $components['MP']); // (3*1 + 2*2) / 5
    }
}
