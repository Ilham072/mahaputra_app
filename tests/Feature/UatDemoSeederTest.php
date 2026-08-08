<?php

namespace Tests\Feature;

use App\Enums\PaymentType;
use App\Enums\UserRole;
use App\Enums\VehicleStatus;
use App\Models\Sale;
use App\Models\Vehicle;
use Database\Seeders\UatDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UatDemoSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_uat_demo_seeder_creates_deterministic_users_vehicles_reports_and_private_placeholders(): void
    {
        Storage::fake('local');

        $this->seed(UatDemoSeeder::class);

        $this->assertDatabaseHas('users', [
            'email' => 'admin@mahaputra.local',
            'role' => UserRole::Admin->value,
        ]);
        $this->assertDatabaseHas('users', [
            'email' => 'owner@mahaputra.local',
            'role' => UserRole::Owner->value,
        ]);

        $readyCashVehicle = Vehicle::query()->where('plate_number', 'DD 1801 UAT')->firstOrFail();
        $readyCreditVehicle = Vehicle::query()->where('plate_number', 'DD 1802 UAT')->firstOrFail();
        $preparationVehicle = Vehicle::query()->where('plate_number', 'DD 1803 UAT')->firstOrFail();

        $this->assertSame(VehicleStatus::Ready, $readyCashVehicle->status);
        $this->assertSame(VehicleStatus::Ready, $readyCreditVehicle->status);
        $this->assertSame(VehicleStatus::Preparation, $preparationVehicle->status);

        $cashSale = Sale::query()
            ->whereHas('vehicle', fn ($query) => $query->where('plate_number', 'DD 1804 UAT'))
            ->firstOrFail();

        $this->assertSame(PaymentType::Cash, $cashSale->payment_type);
        $this->assertSame(120000000, $cashSale->initial_capital_snapshot);
        $this->assertSame(3500000, $cashSale->vehicle_cost_snapshot);
        $this->assertSame(123500000, $cashSale->final_capital_snapshot);
        $this->assertSame(26500000, $cashSale->profit_snapshot);
        $this->assertNull($cashSale->payment?->financing_provider_id);

        $creditSale = Sale::query()
            ->whereHas('vehicle', fn ($query) => $query->where('plate_number', 'DD 1805 UAT'))
            ->firstOrFail();

        $this->assertSame(PaymentType::Credit, $creditSale->payment_type);
        $this->assertSame(130000000, $creditSale->initial_capital_snapshot);
        $this->assertSame(4000000, $creditSale->vehicle_cost_snapshot);
        $this->assertSame(134000000, $creditSale->final_capital_snapshot);
        $this->assertSame(142000000, $creditSale->credit_total);
        $this->assertSame(8000000, $creditSale->profit_snapshot);
        $this->assertSame(20000000, $creditSale->payment?->dp);

        Storage::disk('local')->assertExists('uat/vehicles/DD-1801-UAT/stnk.txt');
        Storage::disk('local')->assertExists('uat/customers/cash-uat/ktp.txt');
        Storage::disk('local')->assertExists('uat/operational-expenses/office-supplies-proof.txt');
    }

    public function test_uat_demo_seeder_can_be_run_repeatedly_without_duplicating_core_data(): void
    {
        Storage::fake('local');

        $this->seed(UatDemoSeeder::class);
        $this->seed(UatDemoSeeder::class);

        $this->assertSame(5, Vehicle::query()->where('plate_number', 'like', 'DD 180% UAT')->count());
        $this->assertSame(
            2,
            Sale::query()->whereHas('vehicle', fn ($query) => $query->where('plate_number', 'like', 'DD 180% UAT'))->count(),
        );
    }
}
