<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear roles
        $adminRole = Role::create(['name' => 'Admin', 'slug' => 'admin']);
        $userRole = Role::create(['name' => 'User', 'slug' => 'user']);

        // Asignar permisos al rol de admin
        $adminRole->permissions()->createMany([
            ['name' => 'Ver configuraciones', 'slug' => 'settings.view'],
            ['name' => 'Editar configuraciones', 'slug' => 'settings.edit']
        ]);

        // Crear usuarios
        $this->admin = User::factory()->create();
        $this->admin->roles()->attach($adminRole);

        $this->regularUser = User::factory()->create();
        $this->regularUser->roles()->attach($userRole);
    }

    /** @test */
    public function admin_can_view_all_settings()
    {
        // Crear algunas configuraciones
        Setting::create([
            'name' => 'site_name',
            'value' => 'VAXAV',
            'type' => 'string',
            'description' => 'Nombre del sitio'
        ]);

        Setting::create([
            'name' => 'maintenance_mode',
            'value' => 'false',
            'type' => 'boolean',
            'description' => 'Modo de mantenimiento'
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/settings');

        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'name',
                    'value',
                    'type',
                    'description',
                    'created_at',
                    'updated_at'
                ]
            ]);
    }

    /** @test */
    public function admin_can_view_single_setting()
    {
        $setting = Setting::create([
            'name' => 'site_name',
            'value' => 'VAXAV',
            'type' => 'string',
            'description' => 'Nombre del sitio'
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/settings/{$setting->id}");

        $response->assertStatus(200)
            ->assertJson([
                'name' => 'site_name',
                'value' => 'VAXAV',
                'type' => 'string',
                'description' => 'Nombre del sitio'
            ]);
    }

    /** @test */
    public function admin_can_create_setting()
    {
        $settingData = [
            'name' => 'new_setting',
            'value' => '42',
            'type' => 'integer',
            'description' => 'Una nueva configuración'
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/settings', $settingData);

        $response->assertStatus(201)
            ->assertJson($settingData);

        $this->assertDatabaseHas('settings', $settingData);
    }

    /** @test */
    public function admin_can_update_setting()
    {
        $setting = Setting::create([
            'name' => 'site_name',
            'value' => 'VAXAV',
            'type' => 'string',
            'description' => 'Nombre del sitio'
        ]);

        $updateData = [
            'value' => 'VAXAV 2.0',
            'description' => 'Nombre actualizado del sitio'
        ];

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/settings/{$setting->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'name' => 'site_name',
                'value' => 'VAXAV 2.0',
                'description' => 'Nombre actualizado del sitio'
            ]);

        $this->assertDatabaseHas('settings', [
            'id' => $setting->id,
            'value' => 'VAXAV 2.0',
            'description' => 'Nombre actualizado del sitio'
        ]);
    }

    /** @test */
    public function admin_can_delete_setting()
    {
        $setting = Setting::create([
            'name' => 'temporary_setting',
            'value' => 'temp',
            'type' => 'string',
            'description' => 'Configuración temporal'
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/settings/{$setting->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Setting deleted successfully'
            ]);

        $this->assertDatabaseMissing('settings', [
            'id' => $setting->id
        ]);
    }

    /** @test */
    public function admin_can_get_setting_by_name()
    {
        $setting = Setting::create([
            'name' => 'site_name',
            'value' => 'VAXAV',
            'type' => 'string',
            'description' => 'Nombre del sitio'
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/settings/name/site_name");

        $response->assertStatus(200)
            ->assertJson([
                'name' => 'site_name',
                'value' => 'VAXAV',
                'type' => 'string'
            ]);
    }

    /** @test */
    public function admin_can_update_setting_by_name()
    {
        $setting = Setting::create([
            'name' => 'site_name',
            'value' => 'VAXAV',
            'type' => 'string',
            'description' => 'Nombre del sitio'
        ]);

        $updateData = [
            'value' => 'VAXAV 2.0',
            'description' => 'Nombre actualizado del sitio'
        ];

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/settings/name/site_name", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'name' => 'site_name',
                'value' => 'VAXAV 2.0',
                'description' => 'Nombre actualizado del sitio'
            ]);
    }

    /** @test */
    public function admin_can_create_setting_by_name_if_not_exists()
    {
        $settingData = [
            'value' => '42',
            'type' => 'integer',
            'description' => 'Una nueva configuración'
        ];

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/settings/name/new_setting", $settingData);

        $response->assertStatus(201)
            ->assertJson([
                'name' => 'new_setting',
                'value' => '42',
                'type' => 'integer',
                'description' => 'Una nueva configuración'
            ]);

        $this->assertDatabaseHas('settings', [
            'name' => 'new_setting',
            'value' => '42'
        ]);
    }

    /** @test */
    public function regular_user_cannot_access_settings()
    {
        $response = $this->actingAs($this->regularUser)
            ->getJson('/api/admin/settings');

        $response->assertStatus(403);
    }

    /** @test */
    public function validation_errors_are_returned_when_creating_invalid_setting()
    {
        $invalidData = [
            'value' => 'Some value',
            'type' => 'invalid_type',
            'description' => 'Descripción'
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/settings', $invalidData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'type']);
    }
}
