<?php

namespace Tests\Feature\Auth;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InternalUserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_local_seed_creates_internal_admin_and_owner_users(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('users', [
            'email' => 'admin@mahaputra.local',
            'name' => 'Admin Showroom',
            'role' => 'admin',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'owner@mahaputra.local',
            'name' => 'Owner Showroom',
            'role' => 'owner',
        ]);
    }
}
