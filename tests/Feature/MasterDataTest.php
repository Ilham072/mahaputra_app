<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Area;
use App\Models\FinancingProvider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MasterDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_master_data_page(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        Area::query()->create(['name' => 'Bone']);

        $this->actingAs($admin)
            ->get(route('master-data.index', ['type' => 'areas']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('MasterData/Index')
                ->where('resource', 'areas')
                ->where('pageTitle', 'Master Data')
                ->where('title', 'Area')
                ->has('items', 1)
            );
    }

    public function test_legacy_master_data_route_redirects_to_unified_page(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $this->actingAs($admin)
            ->get(route('master.index', 'areas'))
            ->assertRedirect(route('master-data.index', ['type' => 'areas']));
    }

    public function test_owner_cannot_manage_master_data(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);

        $this->actingAs($owner)
            ->get(route('master-data.index', ['type' => 'areas']))
            ->assertForbidden();
    }

    public function test_admin_can_create_master_data_item(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $this->actingAs($admin)
            ->post(route('master.store', 'areas'), [
                'name' => 'Makassar',
            ])
            ->assertRedirect(route('master-data.index', ['type' => 'areas']));

        $this->assertDatabaseHas('areas', [
            'name' => 'Makassar',
            'is_active' => true,
        ]);
    }

    public function test_master_data_name_must_be_unique_per_resource(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        Area::query()->create(['name' => 'Bone']);

        $this->actingAs($admin)
            ->from(route('master-data.index', ['type' => 'areas']))
            ->post(route('master.store', 'areas'), [
                'name' => 'Bone',
            ])
            ->assertRedirect(route('master-data.index', ['type' => 'areas']))
            ->assertSessionHasErrors('name');
    }

    public function test_admin_can_update_master_data_item(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $area = Area::query()->create(['name' => 'Bone']);

        $this->actingAs($admin)
            ->patch(route('master.update', ['areas', $area->id]), [
                'name' => 'Bone Utama',
                'is_active' => false,
            ])
            ->assertRedirect(route('master-data.index', ['type' => 'areas']));

        $this->assertDatabaseHas('areas', [
            'id' => $area->id,
            'name' => 'Bone Utama',
            'is_active' => false,
        ]);
    }

    public function test_admin_deactivates_master_data_instead_of_deleting_it(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $area = Area::query()->create(['name' => 'Bone']);

        $this->actingAs($admin)
            ->delete(route('master.destroy', ['areas', $area->id]))
            ->assertRedirect(route('master-data.index', ['type' => 'areas']));

        $this->assertDatabaseHas('areas', [
            'id' => $area->id,
            'name' => 'Bone',
            'is_active' => false,
        ]);
    }

    public function test_local_seed_creates_initial_area_and_financing_provider_values(): void
    {
        $this->seed();

        foreach (['Bone', 'Sinjai', 'Bulukumba', 'Pinrang'] as $area) {
            $this->assertDatabaseHas('areas', [
                'name' => $area,
                'is_active' => true,
            ]);
        }

        foreach (['Adira', 'OTO', 'SMS', 'MUF'] as $provider) {
            $this->assertDatabaseHas('financing_providers', [
                'name' => $provider,
                'is_active' => true,
            ]);
        }

        $this->assertSame(4, FinancingProvider::query()->count());
    }
}
