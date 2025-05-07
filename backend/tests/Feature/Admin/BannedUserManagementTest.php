<?php

namespace Tests\Feature\Admin;

use App\Models\BannedUser;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class BannedUserManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $admin;
    protected $regularUser;
    protected $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear roles
        $adminRole = Role::factory()->admin()->create();
        $superAdminRole = Role::factory()->superAdmin()->create();
        $userRole = Role::factory()->user()->create();

        // Crear usuarios
        $this->admin = User::factory()->create();
        $this->admin->roles()->attach($adminRole);

        $this->superAdmin = User::factory()->create();
        $this->superAdmin->roles()->attach($superAdminRole);

        $this->regularUser = User::factory()->create();
        $this->regularUser->roles()->attach($userRole);
    }

    /** @test */
    public function admin_can_view_banned_users_list()
    {
        // Crear algunos usuarios baneados
        BannedUser::factory()->count(3)->create([
            'banned_by' => $this->admin->id
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/banned-users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'current_page',
                'total'
            ]);

        $this->assertEquals(3, $response->json('total'));
    }

    /** @test */
    public function admin_can_ban_a_user()
    {
        $banData = [
            'user_id' => $this->regularUser->id,
            'reason' => 'Violación de términos de servicio',
            'notes' => 'Múltiples reportes de otros usuarios',
            'type' => 'temporary',
            'expires_at' => now()->addDays(7)->toDateTimeString(),
            'is_active' => true
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/banned-users', $banData);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'user_id' => $this->regularUser->id,
                'reason' => 'Violación de términos de servicio',
                'type' => 'temporary',
                'is_active' => true
            ]);

        $this->assertDatabaseHas('banned_users', [
            'user_id' => $this->regularUser->id,
            'reason' => 'Violación de términos de servicio',
            'banned_by' => $this->admin->id
        ]);
    }

    /** @test */
    public function admin_cannot_ban_a_superadmin()
    {
        $banData = [
            'user_id' => $this->superAdmin->id,
            'reason' => 'Intento de banear a un superadmin',
            'type' => 'permanent',
            'is_active' => true
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/banned-users', $banData);

        $response->assertStatus(403);

        $this->assertDatabaseMissing('banned_users', [
            'user_id' => $this->superAdmin->id
        ]);
    }

    /** @test */
    public function admin_cannot_ban_themselves()
    {
        $banData = [
            'user_id' => $this->admin->id,
            'reason' => 'Intento de auto-baneo',
            'type' => 'temporary',
            'expires_at' => now()->addDays(7)->toDateTimeString(),
            'is_active' => true
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/banned-users', $banData);

        $response->assertStatus(403);

        $this->assertDatabaseMissing('banned_users', [
            'user_id' => $this->admin->id,
            'reason' => 'Intento de auto-baneo'
        ]);
    }

    /** @test */
    public function admin_can_view_ban_details()
    {
        $ban = BannedUser::factory()->create([
            'user_id' => $this->regularUser->id,
            'banned_by' => $this->admin->id
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/banned-users/{$ban->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $ban->id)
            ->assertJsonPath('user_id', $this->regularUser->id);
    }

    /** @test */
    public function admin_can_update_a_ban()
    {
        $ban = BannedUser::factory()->create([
            'user_id' => $this->regularUser->id,
            'banned_by' => $this->admin->id,
            'reason' => 'Razón original',
            'type' => 'temporary',
            'expires_at' => now()->addDays(3)->toDateTimeString()
        ]);

        $updateData = [
            'reason' => 'Razón actualizada',
            'type' => 'permanent',
            'is_active' => true
        ];

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/banned-users/{$ban->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'reason' => 'Razón actualizada',
                'type' => 'permanent'
            ]);

        $this->assertDatabaseHas('banned_users', [
            'id' => $ban->id,
            'reason' => 'Razón actualizada',
            'type' => 'permanent'
        ]);

        // Verificar que expires_at es null para baneos permanentes
        $this->assertNull($response->json('expires_at'));
    }

    /** @test */
    public function admin_can_lift_a_ban()
    {
        $ban = BannedUser::factory()->create([
            'user_id' => $this->regularUser->id,
            'banned_by' => $this->admin->id,
            'is_active' => true
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/banned-users/{$ban->id}/lift");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Baneo levantado correctamente'
            ]);

        $this->assertDatabaseHas('banned_users', [
            'id' => $ban->id,
            'is_active' => false
        ]);
    }

    /** @test */
    public function admin_can_delete_a_ban()
    {
        $ban = BannedUser::factory()->create([
            'user_id' => $this->regularUser->id,
            'banned_by' => $this->admin->id
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/banned-users/{$ban->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Registro de baneo eliminado correctamente'
            ]);

        $this->assertDatabaseMissing('banned_users', [
            'id' => $ban->id
        ]);
    }

    /** @test */
    public function admin_can_view_user_bans()
    {
        // Crear varios baneos para el mismo usuario
        BannedUser::factory()->count(3)->create([
            'user_id' => $this->regularUser->id,
            'banned_by' => $this->admin->id
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/users/{$this->regularUser->id}/bans");

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    /** @test */
    public function admin_can_check_if_user_is_banned()
    {
        // Crear un baneo activo
        BannedUser::factory()->create([
            'user_id' => $this->regularUser->id,
            'banned_by' => $this->admin->id,
            'is_active' => true,
            'type' => 'permanent'
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/users/{$this->regularUser->id}/check-ban");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'banned' => true
            ])
            ->assertJsonStructure([
                'banned',
                'ban' => [
                    'id', 'user_id', 'banned_by', 'reason', 'type', 'is_active'
                ]
            ]);
    }

    /** @test */
    public function regular_user_cannot_access_ban_endpoints()
    {
        $response = $this->actingAs($this->regularUser)
            ->getJson('/api/admin/banned-users');

        $response->assertStatus(403);
    }
}
