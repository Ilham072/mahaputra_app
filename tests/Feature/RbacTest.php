<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware(['web', 'auth', 'role:admin'])
            ->get('/__test/admin-only', fn () => response('admin-ok'));

        Route::middleware(['web', 'auth', 'role:admin,owner'])
            ->get('/__test/read-only', fn () => response('read-ok'));
    }

    public function test_user_role_is_cast_and_exposes_role_helpers(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);

        $this->assertSame(UserRole::Admin, $admin->role);
        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($admin->isOwner());

        $this->assertSame(UserRole::Owner, $owner->role);
        $this->assertTrue($owner->isOwner());
        $this->assertFalse($owner->isAdmin());
    }

    public function test_admin_can_access_admin_only_route(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $this->actingAs($admin)
            ->get('/__test/admin-only')
            ->assertOk()
            ->assertSee('admin-ok');
    }

    public function test_owner_cannot_access_admin_only_route(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);

        $this->actingAs($owner)
            ->get('/__test/admin-only')
            ->assertForbidden();
    }

    public function test_owner_can_access_read_only_route(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);

        $this->actingAs($owner)
            ->get('/__test/read-only')
            ->assertOk()
            ->assertSee('read-ok');
    }

    public function test_guest_is_redirected_before_role_middleware_checks_access(): void
    {
        $this->get('/__test/admin-only')
            ->assertRedirect('/login');
    }
}
