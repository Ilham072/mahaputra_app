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
use App\Models\ExpenseCategory;
use App\Models\OperationalExpense;
use App\Models\Sale;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_shows_current_month_summary_from_stored_data(): void
    {
        $this->travelTo('2026-08-15 10:00:00');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $readyVehicle = $this->createVehicle('DD 1001 MP', VehicleStatus::Ready);
        $preparationVehicle = $this->createVehicle('DD 1002 MP', VehicleStatus::Preparation);
        $soldVehicle = $this->createVehicle('DD 1003 MP', VehicleStatus::Sold);

        $this->createSale($soldVehicle, '2026-08-08', 10000000, 'Pembeli Agustus');
        $this->createSale($this->createVehicle('DD 1004 MP', VehicleStatus::Sold), '2026-07-20', 99000000, 'Pembeli Juli');
        $this->createExpense('2026-08-10', 2000000);
        $this->createExpense('2026-07-10', 7000000);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('period.month', '2026-08')
                ->where('metrics.vehicles_total', 4)
                ->where('metrics.vehicles_ready', 1)
                ->where('metrics.vehicles_preparation', 1)
                ->where('metrics.sales_count', 1)
                ->where('metrics.sales_value', 150000000)
                ->where('metrics.vehicle_profit', 10000000)
                ->where('metrics.operational_total', 2000000)
                ->has('salesTrend', 6)
                ->where('salesTrend.4.month', '2026-07')
                ->where('salesTrend.4.sales_count', 1)
                ->where('salesTrend.4.sales_value', 150000000)
                ->where('salesTrend.5.month', '2026-08')
                ->where('salesTrend.5.sales_count', 1)
                ->where('salesTrend.5.sales_value', 150000000)
                ->has('recentSales', 2)
                ->where('recentSales.0.customer_name', 'Pembeli Agustus')
                ->has('recentVehicles', 4)
            );

        $this->assertSame(VehicleStatus::Preparation, $preparationVehicle->refresh()->status);
        $this->assertSame(VehicleStatus::Ready, $readyVehicle->refresh()->status);
    }

    public function test_dashboard_can_be_filtered_by_month(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $this->createSale(
            $this->createVehicle('DD 2001 MP', VehicleStatus::Sold),
            '2026-07-20',
            15000000,
            paymentType: PaymentType::Credit,
            creditTotal: 138000000,
        );
        $this->createSale($this->createVehicle('DD 2002 MP', VehicleStatus::Sold), '2026-08-20', 5000000);
        $this->createExpense('2026-07-10', 3000000);

        $this->actingAs($admin)
            ->get(route('dashboard', ['month' => '2026-07']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('period.month', '2026-07')
                ->where('metrics.sales_count', 1)
                ->where('metrics.sales_value', 138000000)
                ->where('metrics.vehicle_profit', 15000000)
                ->where('metrics.operational_total', 3000000)
                ->where('salesTrend.5.month', '2026-07')
                ->where('salesTrend.5.sales_value', 138000000)
            );
    }

    public function test_owner_can_view_dashboard(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);

        $this->actingAs($owner)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->has('metrics')
            );
    }

    private function createVehicle(string $plateNumber, VehicleStatus $status): Vehicle
    {
        $brand = VehicleBrand::query()->firstOrCreate(['name' => 'Toyota']);

        return Vehicle::query()->create([
            'purchase_date' => '2026-08-01',
            'brand_id' => $brand->id,
            'type' => 'Avanza',
            'plate_number' => $plateNumber,
            'year' => 2022,
            'color' => 'Hitam',
            'capital_type' => VehicleCapitalType::Khusus->value,
            'showroom_capital' => 120000000,
            'tax_status' => VehicleTaxStatus::On->value,
            'tax_amount' => 1500000,
            'asking_price' => 150000000,
            'status' => $status->value,
        ]);
    }

    private function createSale(
        Vehicle $vehicle,
        string $saleDate,
        int $profit,
        string $customerName = 'Pembeli',
        PaymentType $paymentType = PaymentType::Cash,
        int $creditTotal = 0,
    ): Sale {
        $employee = Employee::query()->firstOrCreate(['name' => 'Admin PIC']);
        $area = Area::query()->firstOrCreate(['name' => 'Bone']);
        $customer = Customer::query()->create([
            'name' => $customerName,
            'whatsapp' => '08123456789',
            'address' => 'Jl. Merdeka',
            'ktp_file_path' => 'customer-ktp/test.jpg',
        ]);

        return Sale::query()->create([
            'vehicle_id' => $vehicle->id,
            'customer_id' => $customer->id,
            'employee_id' => $employee->id,
            'area_id' => $area->id,
            'sale_date' => $saleDate,
            'payment_type' => $paymentType->value,
            'selling_price' => 150000000,
            'credit_total' => $creditTotal,
            'initial_capital_snapshot' => 120000000,
            'vehicle_cost_snapshot' => 0,
            'final_capital_snapshot' => 120000000,
            'profit_snapshot' => $profit,
        ]);
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
