<?php

namespace Tests\Feature;

use App\Enums\PaymentType;
use App\Enums\UserRole;
use App\Enums\VehicleCapitalType;
use App\Enums\VehicleStatus;
use App\Enums\VehicleTaxStatus;
use App\Models\Area;
use App\Models\Collaborator;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\Sale;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class VehicleManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_vehicle_index(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);

        Vehicle::query()->create($this->vehiclePayload([
            'brand_id' => $brand->id,
        ]));

        $this->actingAs($admin)
            ->get(route('vehicles.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Vehicles/Index')
                ->has('vehicles.data', 1)
            );
    }

    public function test_admin_can_view_vehicle_create_form(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        VehicleBrand::query()->create(['name' => 'Toyota']);

        $this->actingAs($admin)
            ->get(route('vehicles.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Vehicles/Form')
                ->where('mode', 'create')
                ->has('options.brands', 1)
            );
    }

    public function test_owner_can_view_vehicle_detail_but_cannot_create_vehicle(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);
        $vehicle = Vehicle::query()->create($this->vehiclePayload([
            'brand_id' => $brand->id,
        ]));

        $this->actingAs($owner)
            ->get(route('vehicles.show', $vehicle))
            ->assertOk();

        $this->actingAs($owner)
            ->get(route('vehicles.create'))
            ->assertForbidden();
    }

    public function test_admin_can_create_umum_vehicle_without_collaborator(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);

        $this->actingAs($admin)
            ->post(route('vehicles.store'), [
                ...$this->vehiclePayload([
                    'brand_id' => $brand->id,
                    'capital_type' => VehicleCapitalType::Umum->value,
                ]),
                'plate_number' => 'dd 1234 xx',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('vehicles', [
            'plate_number' => 'DD 1234 XX',
            'capital_type' => VehicleCapitalType::Umum->value,
            'collaborator_id' => null,
            'collaborator_capital' => 0,
        ]);
    }

    public function test_khusus_vehicle_requires_collaborator(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);

        $this->actingAs($admin)
            ->from(route('vehicles.create'))
            ->post(route('vehicles.store'), [
                ...$this->vehiclePayload([
                    'brand_id' => $brand->id,
                    'capital_type' => VehicleCapitalType::Khusus->value,
                ]),
                'collaborator_name' => '',
                'collaborator_capital' => '',
            ])
            ->assertRedirect(route('vehicles.create'))
            ->assertSessionHasErrors(['collaborator_name', 'collaborator_capital']);
    }

    public function test_admin_can_create_khusus_vehicle_with_one_collaborator(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);

        $this->actingAs($admin)
            ->post(route('vehicles.store'), [
                ...$this->vehiclePayload([
                    'brand_id' => $brand->id,
                    'capital_type' => VehicleCapitalType::Khusus->value,
                ]),
                'collaborator_name' => 'Budi',
                'collaborator_capital' => 50000000,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('collaborators', [
            'name' => 'Budi',
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('vehicles', [
            'plate_number' => 'DD 1234 XX',
            'capital_type' => VehicleCapitalType::Khusus->value,
            'collaborator_capital' => 50000000,
        ]);
    }

    public function test_admin_can_update_vehicle_to_umum_and_clear_collaborator(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);
        $collaborator = Collaborator::query()->create(['name' => 'Budi']);
        $vehicle = Vehicle::query()->create($this->vehiclePayload([
            'brand_id' => $brand->id,
            'capital_type' => VehicleCapitalType::Khusus->value,
            'collaborator_id' => $collaborator->id,
            'collaborator_capital' => 50000000,
        ]));

        $this->actingAs($admin)
            ->patch(route('vehicles.update', $vehicle), [
                ...$this->vehiclePayload([
                    'brand_id' => $brand->id,
                    'capital_type' => VehicleCapitalType::Umum->value,
                    'plate_number' => 'DD 4321 YY',
                ]),
            ])
            ->assertRedirect(route('vehicles.show', $vehicle));

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'plate_number' => 'DD 4321 YY',
            'capital_type' => VehicleCapitalType::Umum->value,
            'collaborator_id' => null,
            'collaborator_capital' => 0,
        ]);
    }

    public function test_vehicle_plate_number_must_be_unique(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);

        Vehicle::query()->create($this->vehiclePayload([
            'brand_id' => $brand->id,
            'plate_number' => 'DD 1234 XX',
        ]));

        $this->actingAs($admin)
            ->from(route('vehicles.create'))
            ->post(route('vehicles.store'), [
                ...$this->vehiclePayload([
                    'brand_id' => $brand->id,
                    'plate_number' => 'dd 1234 xx',
                ]),
            ])
            ->assertRedirect(route('vehicles.create'))
            ->assertSessionHasErrors('plate_number');
    }

    public function test_vehicle_cannot_be_marked_sold_manually_without_sale(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);

        $this->actingAs($admin)
            ->from(route('vehicles.create'))
            ->post(route('vehicles.store'), [
                ...$this->vehiclePayload([
                    'brand_id' => $brand->id,
                    'status' => VehicleStatus::Sold->value,
                ]),
            ])
            ->assertRedirect(route('vehicles.create'))
            ->assertSessionHasErrors('status');
    }

    public function test_sold_vehicle_status_cannot_be_changed_away_from_sold(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);
        $vehicle = Vehicle::query()->create($this->vehiclePayload([
            'brand_id' => $brand->id,
            'status' => VehicleStatus::Sold->value,
        ]));
        $this->createSaleForVehicle($vehicle);

        $this->actingAs($admin)
            ->from(route('vehicles.edit', $vehicle))
            ->patch(route('vehicles.update', $vehicle), [
                ...$this->vehiclePayload([
                    'brand_id' => $brand->id,
                    'status' => VehicleStatus::Ready->value,
                ]),
            ])
            ->assertRedirect(route('vehicles.edit', $vehicle))
            ->assertSessionHasErrors('status');

        $this->assertSame(VehicleStatus::Sold, $vehicle->refresh()->status);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function vehiclePayload(array $overrides = []): array
    {
        return [
            'purchase_date' => '2026-08-08',
            'brand_id' => 1,
            'type' => 'Avanza',
            'plate_number' => 'DD 1234 XX',
            'year' => 2022,
            'color' => 'Hitam',
            'capital_type' => VehicleCapitalType::Umum->value,
            'showroom_capital' => 120000000,
            'tax_status' => VehicleTaxStatus::On->value,
            'tax_amount' => 0,
            'asking_price' => 150000000,
            'status' => VehicleStatus::Preparation->value,
            ...$overrides,
        ];
    }

    private function createSaleForVehicle(Vehicle $vehicle): Sale
    {
        $employee = Employee::query()->create(['name' => 'Admin PIC']);
        $area = Area::query()->create(['name' => 'Bone']);
        $customer = Customer::query()->create([
            'name' => 'Pembeli',
            'whatsapp' => '08123456789',
            'address' => 'Jl. Merdeka',
            'ktp_file_path' => 'customer-ktp/test.jpg',
        ]);

        return Sale::query()->create([
            'vehicle_id' => $vehicle->id,
            'customer_id' => $customer->id,
            'employee_id' => $employee->id,
            'area_id' => $area->id,
            'sale_date' => '2026-08-08',
            'payment_type' => PaymentType::Cash->value,
            'selling_price' => 150000000,
            'credit_total' => 0,
            'initial_capital_snapshot' => 120000000,
            'vehicle_cost_snapshot' => 0,
            'final_capital_snapshot' => 120000000,
            'profit_snapshot' => 30000000,
        ]);
    }
}
