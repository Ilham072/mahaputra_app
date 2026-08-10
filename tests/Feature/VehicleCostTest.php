<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\VehicleCapitalType;
use App\Enums\VehicleCostCategory;
use App\Enums\VehicleStatus;
use App\Enums\VehicleTaxStatus;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use App\Services\VehicleCapitalCalculator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class VehicleCostTest extends TestCase
{
    use RefreshDatabase;

    public function test_vehicle_capital_calculator_returns_initial_cost_and_final_capital(): void
    {
        $calculator = app(VehicleCapitalCalculator::class);

        $initialCapital = $calculator->initialCapital(
            VehicleCapitalType::Khusus,
            120000000,
            50000000,
        );
        $totalCost = $calculator->totalVehicleCost(1500000, 3500000);

        $this->assertSame(170000000, $initialCapital);
        $this->assertSame(5000000, $totalCost);
        $this->assertSame(175000000, $calculator->finalCapital($initialCapital, $totalCost));
    }

    public function test_admin_can_add_vehicle_cost(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $vehicle = $this->createVehicle();

        $this->actingAs($admin)
            ->post(route('vehicles.costs.store', $vehicle), [
                'cost_date' => '2026-08-08',
                'category' => VehicleCostCategory::Dico->value,
                'amount' => 2500000,
                'description' => 'Cat bumper',
            ])
            ->assertRedirect(route('vehicles.show', $vehicle));

        $this->assertDatabaseHas('vehicle_costs', [
            'vehicle_id' => $vehicle->id,
            'category' => VehicleCostCategory::Dico->value,
            'amount' => 2500000,
            'description' => 'Cat bumper',
        ]);
    }

    public function test_owner_cannot_add_vehicle_cost(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $vehicle = $this->createVehicle();

        $this->actingAs($owner)
            ->post(route('vehicles.costs.store', $vehicle), [
                'cost_date' => '2026-08-08',
                'category' => VehicleCostCategory::Dico->value,
                'amount' => 2500000,
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('vehicle_costs', [
            'vehicle_id' => $vehicle->id,
        ]);
    }

    public function test_vehicle_detail_includes_cost_totals_and_final_capital(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $vehicle = $this->createVehicle([
            'tax_amount' => 1500000,
            'showroom_capital' => 120000000,
        ]);

        $vehicle->costs()->create([
            'cost_date' => '2026-08-08',
            'category' => VehicleCostCategory::Dico->value,
            'amount' => 2500000,
        ]);
        $vehicle->costs()->create([
            'cost_date' => '2026-08-09',
            'category' => VehicleCostCategory::Other->value,
            'amount' => 1000000,
        ]);

        $this->actingAs($admin)
            ->get(route('vehicles.show', $vehicle))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Vehicles/Show')
                ->where('vehicle.additional_costs_total', 3500000)
                ->where('vehicle.total_vehicle_cost', 5000000)
                ->where('vehicle.initial_capital', 120000000)
                ->where('vehicle.final_capital', 125000000)
                ->has('vehicle.costs', 2)
                ->has('costCategoryOptions', 3)
            );
    }

    public function test_vehicle_cost_amount_cannot_be_negative(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $vehicle = $this->createVehicle();

        $this->actingAs($admin)
            ->from(route('vehicles.show', $vehicle))
            ->post(route('vehicles.costs.store', $vehicle), [
                'cost_date' => '2026-08-08',
                'category' => VehicleCostCategory::Dico->value,
                'amount' => -1,
            ])
            ->assertRedirect(route('vehicles.show', $vehicle))
            ->assertSessionHasErrors('amount');
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function createVehicle(array $overrides = []): Vehicle
    {
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);

        return Vehicle::query()->create([
            'purchase_date' => '2026-08-08',
            'brand_id' => $brand->id,
            'type' => 'Avanza',
            'plate_number' => 'DD 1234 XX',
            'year' => 2022,
            'color' => 'Hitam',
            'capital_type' => VehicleCapitalType::Khusus->value,
            'showroom_capital' => 120000000,
            'tax_status' => VehicleTaxStatus::On->value,
            'tax_amount' => 0,
            'asking_price' => 150000000,
            'status' => VehicleStatus::Preparation->value,
            ...$overrides,
        ]);
    }
}
