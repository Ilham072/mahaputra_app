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
use App\Models\ExpenseCategory;
use App\Models\OperationalExpense;
use App\Models\Sale;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;
use ZipArchive;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_reports_show_current_month_sales_and_operational_summary(): void
    {
        $this->travelTo('2026-08-15 10:00:00');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $bone = Area::query()->create(['name' => 'Bone']);
        $wajo = Area::query()->create(['name' => 'Wajo']);
        $andi = Employee::query()->create(['name' => 'Andi PIC']);
        $budi = Employee::query()->create(['name' => 'Budi PIC']);

        $this->createSale(
            vehicle: $this->createVehicle('DD 3001 MP', VehicleCapitalType::Khusus),
            area: $bone,
            employee: $andi,
            saleDate: '2026-08-08',
            paymentType: PaymentType::Cash,
            creditTotal: 0,
            profit: 10000000,
        );
        $this->createSale(
            vehicle: $this->createVehicle('DD 3002 MP', VehicleCapitalType::Umum),
            area: $wajo,
            employee: $budi,
            saleDate: '2026-08-12',
            paymentType: PaymentType::Credit,
            creditTotal: 138000000,
            profit: 16500000,
            dp: 20000000,
            outstandingDp: 5000000,
        );
        $this->createSale(
            vehicle: $this->createVehicle('DD 3003 MP', VehicleCapitalType::Khusus),
            area: $bone,
            employee: $andi,
            saleDate: '2026-07-20',
            paymentType: PaymentType::Cash,
            creditTotal: 0,
            profit: 99000000,
        );
        $this->createExpense('2026-08-10', 2000000);
        $this->createExpense('2026-07-10', 7000000);

        $this->actingAs($admin)
            ->get(route('reports.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reports/Index')
                ->where('filters.date_from', '2026-08-01')
                ->where('filters.date_to', '2026-08-31')
                ->where('summary.sales_count', 2)
                ->where('summary.sales_value', 288000000)
                ->where('summary.profit_total', 26500000)
                ->where('summary.operational_total', 2000000)
                ->where('summary.profit_minus_operational', 24500000)
                ->has('sales.data', 2)
                ->where('sales.data.0.payment_type', PaymentType::Credit->value)
                ->where('sales.data.0.dp', 20000000)
                ->where('sales.data.0.outstanding_dp', 5000000)
                ->where('sales.data.0.vehicle_cost_snapshot', 3500000)
                ->has('operations.recent', 1)
            );
    }

    public function test_reports_can_filter_sales_by_area_payment_capital_and_search(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $bone = Area::query()->create(['name' => 'Bone']);
        $wajo = Area::query()->create(['name' => 'Wajo']);
        $andi = Employee::query()->create(['name' => 'Andi PIC']);

        $this->createSale(
            vehicle: $this->createVehicle('DD 4001 MP', VehicleCapitalType::Umum),
            area: $bone,
            employee: $andi,
            saleDate: '2026-08-08',
            paymentType: PaymentType::Credit,
            creditTotal: 138000000,
            profit: 15000000,
            customerName: 'Sari',
        );
        $this->createSale(
            vehicle: $this->createVehicle('DD 4002 MP', VehicleCapitalType::Khusus),
            area: $wajo,
            employee: $andi,
            saleDate: '2026-08-09',
            paymentType: PaymentType::Cash,
            creditTotal: 0,
            profit: 10000000,
            customerName: 'Baso',
        );

        $this->actingAs($admin)
            ->get(route('reports.index', [
                'date_from' => '2026-08-01',
                'date_to' => '2026-08-31',
                'area_id' => $bone->id,
                'payment_type' => PaymentType::Credit->value,
                'capital_type' => VehicleCapitalType::Umum->value,
                'search' => 'Sari',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('summary.sales_count', 1)
                ->where('summary.profit_total', 15000000)
                ->has('sales.data', 1)
                ->where('sales.data.0.plate_number', 'DD 4001 MP')
            );
    }

    public function test_owner_can_view_reports_and_guest_is_redirected(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);

        $this->get(route('reports.index'))
            ->assertRedirect('/login');

        $this->actingAs($owner)
            ->get(route('reports.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reports/Index')
                ->has('summary')
            );
    }

    public function test_reports_validate_filter_input(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);

        $this->actingAs($admin)
            ->from(route('reports.index'))
            ->get(route('reports.index', [
                'date_from' => 'bukan-tanggal',
                'payment_type' => 'TRANSFER',
            ]))
            ->assertRedirect(route('reports.index'))
            ->assertSessionHasErrors(['date_from', 'payment_type']);
    }

    public function test_reports_can_export_filtered_sales_to_xlsx(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $bone = Area::query()->create(['name' => 'Bone']);
        $wajo = Area::query()->create(['name' => 'Wajo']);
        $andi = Employee::query()->create(['name' => 'Andi PIC']);

        $this->createSale(
            vehicle: $this->createVehicle('DD 5001 MP', VehicleCapitalType::Khusus),
            area: $bone,
            employee: $andi,
            saleDate: '2026-08-08',
            paymentType: PaymentType::Cash,
            creditTotal: 0,
            profit: 10000000,
            customerName: 'Sari',
        );
        $this->createSale(
            vehicle: $this->createVehicle('DD 5002 MP', VehicleCapitalType::Umum),
            area: $wajo,
            employee: $andi,
            saleDate: '2026-08-09',
            paymentType: PaymentType::Credit,
            creditTotal: 138000000,
            profit: 15000000,
            customerName: 'Baso',
        );

        $response = $this->actingAs($admin)
            ->get(route('reports.export.excel', [
                'date_from' => '2026-08-01',
                'date_to' => '2026-08-31',
                'area_id' => $bone->id,
            ]))
            ->assertOk()
            ->assertDownload('laporan-penjualan-2026-08-01-2026-08-31.xlsx');

        $path = $response->baseResponse->getFile()->getPathname();
        $zip = new ZipArchive;

        $this->assertTrue($zip->open($path));
        $worksheet = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();

        $this->assertIsString($worksheet);
        $this->assertStringContainsString('Laporan Penjualan Mahaputra Group', $worksheet);
        $this->assertStringContainsString('DD 5001 MP', $worksheet);
        $this->assertStringNotContainsString('DD 5002 MP', $worksheet);
    }

    public function test_reports_pdf_data_uses_active_filters(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $bone = Area::query()->create(['name' => 'Bone']);
        $wajo = Area::query()->create(['name' => 'Wajo']);
        $andi = Employee::query()->create(['name' => 'Andi PIC']);

        $this->createSale(
            vehicle: $this->createVehicle('DD 6001 MP', VehicleCapitalType::Khusus),
            area: $bone,
            employee: $andi,
            saleDate: '2026-08-08',
            paymentType: PaymentType::Cash,
            creditTotal: 0,
            profit: 10000000,
            customerName: 'Sari',
        );
        $this->createSale(
            vehicle: $this->createVehicle('DD 6002 MP', VehicleCapitalType::Umum),
            area: $wajo,
            employee: $andi,
            saleDate: '2026-08-09',
            paymentType: PaymentType::Credit,
            creditTotal: 138000000,
            profit: 15000000,
            customerName: 'Baso',
        );

        $this->actingAs($owner)
            ->getJson(route('reports.export.pdf-data', [
                'date_from' => '2026-08-01',
                'date_to' => '2026-08-31',
                'area_id' => $bone->id,
            ]))
            ->assertOk()
            ->assertJsonPath('summary.sales_count', 1)
            ->assertJsonPath('summary.profit_total', 10000000)
            ->assertJsonPath('rows.0.plate_number', 'DD 6001 MP')
            ->assertJsonMissing(['plate_number' => 'DD 6002 MP']);
    }

    private function createVehicle(string $plateNumber, VehicleCapitalType $capitalType): Vehicle
    {
        $brand = VehicleBrand::query()->firstOrCreate(['name' => 'Toyota']);
        $collaborator = $capitalType === VehicleCapitalType::Khusus
            ? Collaborator::query()->firstOrCreate(['name' => 'Kolaborator A'])
            : null;

        return Vehicle::query()->create([
            'purchase_date' => '2026-08-01',
            'brand_id' => $brand->id,
            'type' => 'Avanza',
            'plate_number' => $plateNumber,
            'year' => 2022,
            'color' => 'Hitam',
            'capital_type' => $capitalType->value,
            'showroom_capital' => 120000000,
            'collaborator_id' => $collaborator?->id,
            'collaborator_capital' => $collaborator ? 10000000 : 0,
            'tax_status' => VehicleTaxStatus::On->value,
            'tax_amount' => 1500000,
            'asking_price' => 150000000,
            'status' => VehicleStatus::Sold->value,
        ]);
    }

    private function createSale(
        Vehicle $vehicle,
        Area $area,
        Employee $employee,
        string $saleDate,
        PaymentType $paymentType,
        int $creditTotal,
        int $profit,
        int $dp = 0,
        int $outstandingDp = 0,
        string $customerName = 'Pembeli',
    ): Sale {
        $customer = Customer::query()->create([
            'name' => $customerName,
            'whatsapp' => '08123456789',
            'address' => 'Jl. Merdeka',
            'ktp_file_path' => 'customer-ktp/test.jpg',
        ]);

        $sale = Sale::query()->create([
            'vehicle_id' => $vehicle->id,
            'customer_id' => $customer->id,
            'employee_id' => $employee->id,
            'area_id' => $area->id,
            'sale_date' => $saleDate,
            'payment_type' => $paymentType->value,
            'selling_price' => 150000000,
            'credit_total' => $creditTotal,
            'initial_capital_snapshot' => 120000000,
            'vehicle_cost_snapshot' => 3500000,
            'final_capital_snapshot' => 123500000,
            'profit_snapshot' => $profit,
        ]);

        $sale->payment()->create([
            'dp' => $dp,
            'outstanding_dp' => $outstandingDp,
            'financing_disbursement' => max($creditTotal - $dp - $outstandingDp, 0),
            'refund' => 0,
        ]);

        return $sale;
    }

    private function createExpense(string $transactionDate, int $amount): OperationalExpense
    {
        $category = ExpenseCategory::query()->firstOrCreate(['name' => 'Listrik']);

        return OperationalExpense::query()->create([
            'category_id' => $category->id,
            'transaction_date' => $transactionDate,
            'amount' => $amount,
            'proof_file_path' => 'operational-expenses/proofs/test.pdf',
        ]);
    }
}
