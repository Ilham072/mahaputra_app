<?php

namespace Tests\Feature;

use App\Actions\CreateSaleAction;
use App\Enums\PaymentType;
use App\Enums\UserRole;
use App\Enums\VehicleCapitalType;
use App\Enums\VehicleCostCategory;
use App\Enums\VehicleStatus;
use App\Enums\VehicleTaxStatus;
use App\Models\Area;
use App\Models\Employee;
use App\Models\FinancingProvider;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SaleFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_cash_sale_and_vehicle_becomes_sold(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $vehicle = $this->createVehicle();
        $this->createSaleOptions();

        $vehicle->costs()->create([
            'cost_date' => '2026-08-08',
            'category' => VehicleCostCategory::Dico->value,
            'amount' => 2000000,
        ]);

        $this->actingAs($admin)
            ->post(route('vehicles.sales.store', $vehicle), [
                ...$this->salePayload(),
                'selling_price' => 150000000,
                'payment_type' => PaymentType::Cash->value,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('sales', [
            'vehicle_id' => $vehicle->id,
            'payment_type' => PaymentType::Cash->value,
            'selling_price' => 150000000,
            'credit_total' => 0,
            'initial_capital_snapshot' => 120000000,
            'vehicle_cost_snapshot' => 3500000,
            'final_capital_snapshot' => 123500000,
            'profit_snapshot' => 26500000,
        ]);

        $this->assertDatabaseHas('sale_payments', [
            'financing_provider_id' => null,
            'dp' => 0,
            'outstanding_dp' => 0,
            'financing_disbursement' => 0,
            'refund' => 0,
        ]);

        $this->assertSame(VehicleStatus::Sold, $vehicle->refresh()->status);
        Storage::disk('local')->assertExists($vehicle->sale->customer->ktp_file_path);
    }

    public function test_admin_can_create_credit_sale_with_credit_profit_formula(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $vehicle = $this->createVehicle();
        $options = $this->createSaleOptions();

        $this->actingAs($admin)
            ->post(route('vehicles.sales.store', $vehicle), [
                ...$this->salePayload(),
                'payment_type' => PaymentType::Credit->value,
                'financing_provider_id' => $options['provider']->id,
                'dp' => 20000000,
                'outstanding_dp' => 5000000,
                'financing_disbursement' => 110000000,
                'refund' => 3000000,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('sales', [
            'vehicle_id' => $vehicle->id,
            'payment_type' => PaymentType::Credit->value,
            'credit_total' => 138000000,
            'final_capital_snapshot' => 121500000,
            'profit_snapshot' => 16500000,
        ]);

        $this->assertDatabaseHas('sale_payments', [
            'financing_provider_id' => $options['provider']->id,
            'dp' => 20000000,
            'outstanding_dp' => 5000000,
            'financing_disbursement' => 110000000,
            'refund' => 3000000,
        ]);
    }

    public function test_cash_sale_rejects_credit_fields(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $vehicle = $this->createVehicle();
        $options = $this->createSaleOptions();

        $this->actingAs($admin)
            ->from(route('vehicles.sales.create', $vehicle))
            ->post(route('vehicles.sales.store', $vehicle), [
                ...$this->salePayload(),
                'payment_type' => PaymentType::Cash->value,
                'financing_provider_id' => $options['provider']->id,
                'dp' => 1,
            ])
            ->assertRedirect(route('vehicles.sales.create', $vehicle))
            ->assertSessionHasErrors(['financing_provider_id', 'dp']);
    }

    public function test_credit_sale_requires_financing_provider(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $vehicle = $this->createVehicle();
        $this->createSaleOptions();

        $this->actingAs($admin)
            ->from(route('vehicles.sales.create', $vehicle))
            ->post(route('vehicles.sales.store', $vehicle), [
                ...$this->salePayload(),
                'payment_type' => PaymentType::Credit->value,
                'dp' => 1,
                'outstanding_dp' => 0,
                'financing_disbursement' => 1,
                'refund' => 0,
            ])
            ->assertRedirect(route('vehicles.sales.create', $vehicle))
            ->assertSessionHasErrors('financing_provider_id');
    }

    public function test_sold_vehicle_cannot_be_sold_twice(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $vehicle = $this->createVehicle();
        $this->createSaleOptions();

        $this->actingAs($admin)
            ->post(route('vehicles.sales.store', $vehicle), $this->salePayload())
            ->assertRedirect();

        $this->actingAs($admin)
            ->post(route('vehicles.sales.store', $vehicle), $this->salePayload())
            ->assertUnprocessable();
    }

    public function test_owner_cannot_create_sale(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $vehicle = $this->createVehicle();
        $this->createSaleOptions();

        $this->actingAs($owner)
            ->post(route('vehicles.sales.store', $vehicle), $this->salePayload())
            ->assertForbidden();
    }

    public function test_sale_detail_and_private_ktp_download_are_authenticated(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $vehicle = $this->createVehicle();
        $this->createSaleOptions();

        $this->actingAs($admin)
            ->post(route('vehicles.sales.store', $vehicle), $this->salePayload());

        $sale = $vehicle->sale()->firstOrFail();

        $this->post(route('logout'));

        $this->get(route('sales.ktp.download', $sale))
            ->assertRedirect('/login');

        $this->actingAs($owner)
            ->get(route('sales.show', $sale))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Sales/Show')
                ->where('sale.customer.name', 'Andi')
            );

        $this->actingAs($owner)
            ->get(route('sales.ktp.download', $sale))
            ->assertOk();
    }

    public function test_customer_ktp_file_is_removed_when_sale_write_fails(): void
    {
        Storage::fake('local');

        $vehicle = $this->createVehicle();
        $this->createSaleOptions();

        try {
            app(CreateSaleAction::class)->execute($vehicle, [
                ...$this->salePayload(),
                'area_id' => 999,
            ]);
        } catch (QueryException) {
            $this->assertSame([], Storage::disk('local')->allFiles('customers'));
            $this->assertDatabaseMissing('customers', [
                'name' => 'Andi',
            ]);

            return;
        }

        $this->fail('Expected database write to fail.');
    }

    /**
     * @return array{area: Area, employee: Employee, provider: FinancingProvider}
     */
    private function createSaleOptions(): array
    {
        return [
            'area' => Area::query()->create(['name' => 'Bone']),
            'employee' => Employee::query()->create(['name' => 'Admin PIC']),
            'provider' => FinancingProvider::query()->create(['name' => 'Adira']),
        ];
    }

    private function createVehicle(): Vehicle
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
            'tax_amount' => 1500000,
            'asking_price' => 150000000,
            'status' => VehicleStatus::Ready->value,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function salePayload(): array
    {
        $area = Area::query()->firstOrFail();
        $employee = Employee::query()->firstOrFail();

        return [
            'sale_date' => '2026-08-08',
            'employee_id' => $employee->id,
            'area_id' => $area->id,
            'customer_name' => 'Andi',
            'customer_whatsapp' => '08123456789',
            'customer_alternative_whatsapp' => null,
            'customer_address' => 'Jl. Merdeka',
            'customer_ktp' => UploadedFile::fake()->image('ktp.jpg'),
            'payment_type' => PaymentType::Cash->value,
            'selling_price' => 150000000,
        ];
    }
}
