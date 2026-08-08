<?php

namespace Tests\Feature;

use App\Actions\UpdateSaleAction;
use App\Enums\PaymentType;
use App\Enums\UserRole;
use App\Enums\VehicleCapitalType;
use App\Enums\VehicleCostCategory;
use App\Enums\VehicleStatus;
use App\Enums\VehicleTaxStatus;
use App\Models\Area;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\FinancingProvider;
use App\Models\Sale;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SaleEditTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_sale_edit_form(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $sale = $this->createSale(PaymentType::Cash);

        $this->actingAs($admin)
            ->get(route('sales.edit', $sale))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Sales/Form')
                ->where('mode', 'edit')
                ->where('sale.id', $sale->id)
                ->where('sale.customer_name', 'Pembeli Lama')
            );
    }

    public function test_admin_can_update_sale_to_credit_and_recalculate_snapshots(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $sale = $this->createSale(PaymentType::Cash);
        $options = $this->saleOptions();

        $sale->vehicle->costs()->create([
            'cost_date' => '2026-08-09',
            'category' => VehicleCostCategory::Dico->value,
            'amount' => 2000000,
            'description' => 'Biaya tambahan setelah sale.',
        ]);

        $this->actingAs($admin)
            ->from(route('sales.edit', $sale))
            ->post(route('sales.update', $sale), [
                '_method' => 'patch',
                ...$this->updatePayload([
                    'employee_id' => $options['employee']->id,
                    'area_id' => $options['area']->id,
                    'payment_type' => PaymentType::Credit->value,
                    'financing_provider_id' => $options['provider']->id,
                    'dp' => 20000000,
                    'outstanding_dp' => 5000000,
                    'financing_disbursement' => 115000000,
                    'refund' => 2000000,
                ]),
            ])
            ->assertRedirect(route('sales.show', $sale));

        $sale->refresh();

        $this->assertSame(PaymentType::Credit, $sale->payment_type);
        $this->assertSame(142000000, $sale->credit_total);
        $this->assertSame(120000000, $sale->initial_capital_snapshot);
        $this->assertSame(3500000, $sale->vehicle_cost_snapshot);
        $this->assertSame(123500000, $sale->final_capital_snapshot);
        $this->assertSame(18500000, $sale->profit_snapshot);
        $this->assertSame('Pembeli Baru', $sale->customer->fresh()->name);
        $this->assertSame($options['provider']->id, $sale->payment->fresh()->financing_provider_id);
        $this->assertSame(20000000, $sale->payment->fresh()->dp);
    }

    public function test_admin_can_update_credit_sale_to_cash_and_clear_credit_payment_fields(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $sale = $this->createSale(PaymentType::Credit);
        $options = $this->saleOptions();

        $this->actingAs($admin)
            ->post(route('sales.update', $sale), [
                '_method' => 'patch',
                ...$this->updatePayload([
                    'employee_id' => $options['employee']->id,
                    'area_id' => $options['area']->id,
                    'payment_type' => PaymentType::Cash->value,
                    'selling_price' => 151000000,
                ]),
            ])
            ->assertRedirect(route('sales.show', $sale));

        $sale->refresh();

        $this->assertSame(PaymentType::Cash, $sale->payment_type);
        $this->assertSame(0, $sale->credit_total);
        $this->assertSame(29500000, $sale->profit_snapshot);
        $this->assertNull($sale->payment->fresh()->financing_provider_id);
        $this->assertSame(0, $sale->payment->fresh()->dp);
        $this->assertSame(0, $sale->payment->fresh()->outstanding_dp);
        $this->assertSame(0, $sale->payment->fresh()->financing_disbursement);
        $this->assertSame(0, $sale->payment->fresh()->refund);
    }

    public function test_owner_cannot_edit_sale(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $sale = $this->createSale(PaymentType::Cash);

        $this->actingAs($owner)
            ->get(route('sales.edit', $sale))
            ->assertForbidden();

        $this->actingAs($owner)
            ->post(route('sales.update', $sale), [
                '_method' => 'patch',
                ...$this->updatePayload(),
            ])
            ->assertForbidden();
    }

    public function test_new_customer_ktp_is_removed_when_sale_update_fails(): void
    {
        Storage::fake('local');

        $sale = $this->createSale(PaymentType::Cash);
        $oldPath = $sale->customer->ktp_file_path;
        Storage::disk('local')->put($oldPath, 'old ktp');

        try {
            app(UpdateSaleAction::class)->execute($sale, [
                ...$this->updatePayload([
                    'area_id' => 999,
                    'customer_ktp' => UploadedFile::fake()->image('new-ktp.jpg'),
                ]),
            ]);
        } catch (QueryException) {
            Storage::disk('local')->assertExists($oldPath);
            $this->assertSame([$oldPath], Storage::disk('local')->allFiles('customers'));
            $this->assertSame('Pembeli Lama', $sale->customer->fresh()->name);

            return;
        }

        $this->fail('Expected sale update to fail.');
    }

    /**
     * @return array{area: Area, employee: Employee, provider: FinancingProvider}
     */
    private function saleOptions(): array
    {
        return [
            'area' => Area::query()->firstOrCreate(['name' => 'Makassar']),
            'employee' => Employee::query()->firstOrCreate(['name' => 'PIC Baru']),
            'provider' => FinancingProvider::query()->firstOrCreate(['name' => 'Adira']),
        ];
    }

    private function createSale(PaymentType $paymentType): Sale
    {
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);
        $vehicle = Vehicle::query()->create([
            'purchase_date' => '2026-08-01',
            'brand_id' => $brand->id,
            'type' => 'Avanza',
            'plate_number' => 'DD 2201 EDT',
            'year' => 2022,
            'color' => 'Hitam',
            'capital_type' => VehicleCapitalType::Khusus->value,
            'showroom_capital' => 120000000,
            'tax_status' => VehicleTaxStatus::On->value,
            'tax_amount' => 1500000,
            'asking_price' => 150000000,
            'status' => VehicleStatus::Sold->value,
        ]);
        $customer = Customer::query()->create([
            'name' => 'Pembeli Lama',
            'whatsapp' => '08123456789',
            'address' => 'Jl. Lama',
            'ktp_file_path' => 'customers/vehicles/'.$vehicle->id.'/ktp/old.jpg',
            'ktp_original_name' => 'old.jpg',
        ]);
        $employee = Employee::query()->create(['name' => 'PIC Lama']);
        $area = Area::query()->create(['name' => 'Bone']);
        $provider = FinancingProvider::query()->create(['name' => 'MUF']);

        $sale = Sale::query()->create([
            'vehicle_id' => $vehicle->id,
            'customer_id' => $customer->id,
            'employee_id' => $employee->id,
            'area_id' => $area->id,
            'sale_date' => '2026-08-08',
            'payment_type' => $paymentType->value,
            'selling_price' => 150000000,
            'credit_total' => $paymentType === PaymentType::Credit ? 138000000 : 0,
            'initial_capital_snapshot' => 120000000,
            'vehicle_cost_snapshot' => 1500000,
            'final_capital_snapshot' => 121500000,
            'profit_snapshot' => $paymentType === PaymentType::Credit ? 16500000 : 28500000,
        ]);

        $sale->payment()->create([
            'financing_provider_id' => $paymentType === PaymentType::Credit ? $provider->id : null,
            'dp' => $paymentType === PaymentType::Credit ? 20000000 : 0,
            'outstanding_dp' => $paymentType === PaymentType::Credit ? 5000000 : 0,
            'financing_disbursement' => $paymentType === PaymentType::Credit ? 110000000 : 0,
            'refund' => $paymentType === PaymentType::Credit ? 3000000 : 0,
        ]);

        return $sale;
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function updatePayload(array $overrides = []): array
    {
        $options = $this->saleOptions();

        return [
            'sale_date' => '2026-08-10',
            'employee_id' => $options['employee']->id,
            'area_id' => $options['area']->id,
            'customer_name' => 'Pembeli Baru',
            'customer_whatsapp' => '08222222222',
            'customer_alternative_whatsapp' => null,
            'customer_address' => 'Jl. Baru',
            'payment_type' => PaymentType::Cash->value,
            'selling_price' => 150000000,
            ...$overrides,
        ];
    }
}
