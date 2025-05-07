<?php

namespace Tests\Unit;

use App\Models\BannedUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserBanTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_is_banned_when_has_active_permanent_ban()
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();

        // Crear un baneo permanente activo
        BannedUser::factory()->create([
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'type' => 'permanent',
            'is_active' => true,
            'expires_at' => null
        ]);

        $this->assertTrue($user->isBanned());
        $this->assertNotNull($user->activeBan());
        $this->assertEquals('permanent', $user->activeBan()->type);
    }

    /** @test */
    public function user_is_banned_when_has_active_temporary_ban_not_expired()
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();

        // Crear un baneo temporal activo que no ha expirado
        BannedUser::factory()->create([
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'type' => 'temporary',
            'is_active' => true,
            'expires_at' => now()->addDays(7)
        ]);

        $this->assertTrue($user->isBanned());
        $this->assertNotNull($user->activeBan());
        $this->assertEquals('temporary', $user->activeBan()->type);
    }

    /** @test */
    public function user_is_not_banned_when_has_inactive_ban()
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();

        // Crear un baneo inactivo
        BannedUser::factory()->create([
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'type' => 'permanent',
            'is_active' => false
        ]);

        $this->assertFalse($user->isBanned());
        $this->assertNull($user->activeBan());
    }

    /** @test */
    public function user_is_not_banned_when_temporary_ban_has_expired()
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();

        // Crear un baneo temporal que ya expiró
        BannedUser::factory()->create([
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'type' => 'temporary',
            'is_active' => true,
            'expires_at' => now()->subDays(1)
        ]);

        $this->assertFalse($user->isBanned());
        $this->assertNull($user->activeBan());
    }

    /** @test */
    public function user_is_banned_with_most_recent_active_ban()
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();

        // Crear varios baneos con diferentes estados
        // Un baneo antiguo inactivo
        BannedUser::factory()->create([
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'type' => 'permanent',
            'is_active' => false,
            'created_at' => now()->subDays(10)
        ]);

        // Un baneo temporal expirado
        BannedUser::factory()->create([
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'type' => 'temporary',
            'is_active' => true,
            'expires_at' => now()->subDays(1),
            'created_at' => now()->subDays(5)
        ]);

        // Un baneo activo reciente
        $activeBan = BannedUser::factory()->create([
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'type' => 'permanent',
            'is_active' => true,
            'created_at' => now()
        ]);

        $this->assertTrue($user->isBanned());
        $this->assertNotNull($user->activeBan());
        $this->assertEquals($activeBan->id, $user->activeBan()->id);
    }

    /** @test */
    public function user_without_bans_is_not_banned()
    {
        $user = User::factory()->create();

        $this->assertFalse($user->isBanned());
        $this->assertNull($user->activeBan());
    }

    /** @test */
    public function banned_user_model_can_determine_if_ban_is_permanent()
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();

        $permanentBan = BannedUser::factory()->create([
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'type' => 'permanent'
        ]);

        $temporaryBan = BannedUser::factory()->create([
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'type' => 'temporary',
            'expires_at' => now()->addDays(7)
        ]);

        $this->assertTrue($permanentBan->isPermanent());
        $this->assertFalse($permanentBan->isTemporary());

        $this->assertFalse($temporaryBan->isPermanent());
        $this->assertTrue($temporaryBan->isTemporary());
    }

    /** @test */
    public function banned_user_model_can_determine_if_ban_is_active()
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();

        // Baneo permanente activo
        $permanentActiveBan = BannedUser::factory()->create([
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'type' => 'permanent',
            'is_active' => true
        ]);

        // Baneo permanente inactivo
        $permanentInactiveBan = BannedUser::factory()->create([
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'type' => 'permanent',
            'is_active' => false
        ]);

        // Baneo temporal activo no expirado
        $temporaryActiveBan = BannedUser::factory()->create([
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'type' => 'temporary',
            'is_active' => true,
            'expires_at' => now()->addDays(7)
        ]);

        // Baneo temporal activo pero expirado
        $temporaryExpiredBan = BannedUser::factory()->create([
            'user_id' => $user->id,
            'banned_by' => $admin->id,
            'type' => 'temporary',
            'is_active' => true,
            'expires_at' => now()->subDays(1)
        ]);

        $this->assertTrue($permanentActiveBan->isActive());
        $this->assertFalse($permanentInactiveBan->isActive());
        $this->assertTrue($temporaryActiveBan->isActive());
        $this->assertFalse($temporaryExpiredBan->isActive());
    }
}
