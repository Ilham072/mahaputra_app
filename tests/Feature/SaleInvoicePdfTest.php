<?php

namespace Tests\Feature;

use App\Enums\PaymentType;
use App\Enums\UserRole;
use App\Enums\VehicleCapitalType;
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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SaleInvoicePdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_invoice_pdf_data_is_customer_safe_for_cash_sale(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $sale = $this->createSale(PaymentType::Cash);

        $this->actingAs($owner)
            ->getJson(route('sales.invoice-data', $sale))
            ->assertOk()
            ->assertJsonPath('invoice.number', 'INV-20260808-'.str_pad((string) $sale->id, 5, '0', STR_PAD_LEFT))
            ->assertJsonPath('invoice.payment_type', PaymentType::Cash->value)
            ->assertJsonPath('invoice.transaction_total', 150000000)
            ->assertJsonPath('vehicle.plate_number', 'DD 2101 INV')
            ->assertJsonPath('customer.name', 'Pembeli Invoice')
            ->assertJsonPath('payment.selling_price', 150000000)
            ->assertJsonMissingPath('final_capital_snapshot')
            ->assertJsonMissingPath('profit_snapshot')
            ->assertJsonMissingPath('initial_capital_snapshot')
            ->assertJsonMissingPath('vehicle.showroom_capital')
            ->assertJsonMissingPath('vehicle.collaborator_capital')
            ->assertJsonMissingPath('customer.ktp_file_path')
            ->assertJsonMissingPath('customer.ktp_download_url');
    }

    public function test_invoice_pdf_data_includes_customer_facing_credit_breakdown(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $sale = $this->createSale(PaymentType::Credit);

        $this->actingAs($admin)
            ->getJson(route('sales.invoice-data', $sale))
            ->assertOk()
            ->assertJsonPath('invoice.payment_type', PaymentType::Credit->value)
            ->assertJsonPath('invoice.transaction_total', 138000000)
            ->assertJsonPath('payment.financing_provider', 'Adira')
            ->assertJsonPath('payment.dp', 20000000)
            ->assertJsonPath('payment.outstanding_dp', 5000000)
            ->assertJsonPath('payment.financing_disbursement', 110000000)
            ->assertJsonPath('payment.refund', 3000000)
            ->assertJsonMissingPath('profit_snapshot')
            ->assertJsonMissingPath('vehicle_cost_snapshot');
    }

    public function test_guest_cannot_load_invoice_pdf_data(): void
    {
        $sale = $this->createSale(PaymentType::Cash);

        $this->getJson(route('sales.invoice-data', $sale))
            ->assertUnauthorized();
    }

    private function createSale(PaymentType $paymentType): Sale
    {
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);
        $vehicle = Vehicle::query()->create([
            'purchase_date' => '2026-08-01',
            'brand_id' => $brand->id,
            'type' => 'Avanza',
            'plate_number' => 'DD 2101 INV',
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
            'name' => 'Pembeli Invoice',
            'whatsapp' => '08123456789',
            'alternative_whatsapp' => '08999999999',
            'address' => 'Jl. Invoice',
            'ktp_file_path' => 'customers/ktp/private.jpg',
            'ktp_original_name' => 'ktp.jpg',
        ]);
        $employee = Employee::query()->create(['name' => 'Admin PIC']);
        $area = Area::query()->create(['name' => 'Bone']);

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
            'vehicle_cost_snapshot' => 3500000,
            'final_capital_snapshot' => 123500000,
            'profit_snapshot' => 26500000,
        ]);

        $provider = $paymentType === PaymentType::Credit
            ? FinancingProvider::query()->create(['name' => 'Adira'])
            : null;

        $sale->payment()->create([
            'financing_provider_id' => $provider?->id,
            'dp' => $paymentType === PaymentType::Credit ? 20000000 : 0,
            'outstanding_dp' => $paymentType === PaymentType::Credit ? 5000000 : 0,
            'financing_disbursement' => $paymentType === PaymentType::Credit ? 110000000 : 0,
            'refund' => $paymentType === PaymentType::Credit ? 3000000 : 0,
        ]);

        return $sale;
    }
}
