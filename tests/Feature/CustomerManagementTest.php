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
use App\Models\Sale;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CustomerManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_and_owner_can_view_customer_index_with_search(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $matchingCustomer = $this->createCustomerWithSale('Andi Customer', '0811111111', 'DD 2301 CST');
        $this->createCustomerWithSale('Budi Customer', '0822222222', 'DD 2302 CST');

        $this->actingAs($admin)
            ->get(route('customers.index', ['search' => 'Andi']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customers/Index')
                ->where('filters.search', 'Andi')
                ->has('customers.data', 1)
                ->where('customers.data.0.id', $matchingCustomer->id)
                ->where('customers.data.0.sales_count', 1)
            );

        $this->actingAs($owner)
            ->get(route('customers.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customers/Index')
                ->has('customers.data', 2)
            );
    }

    public function test_customer_detail_includes_purchase_history_without_ktp_thumbnail(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $customer = $this->createCustomerWithSale('Andi Customer', '0811111111', 'DD 2301 CST');

        $this->actingAs($owner)
            ->get(route('customers.show', $customer))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customers/Show')
                ->where('customer.name', 'Andi Customer')
                ->where('customer.ktp_original_name', 'ktp.jpg')
                ->where('customer.sales.0.plate_number', 'DD 2301 CST')
                ->missing('customer.ktp_file_path')
            );
    }

    public function test_admin_can_edit_customer_basic_data(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $customer = $this->createCustomerWithSale('Andi Customer', '0811111111', 'DD 2301 CST');

        $this->actingAs($admin)
            ->get(route('customers.edit', $customer))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customers/Form')
                ->where('customer.name', 'Andi Customer')
            );

        $this->actingAs($admin)
            ->from(route('customers.edit', $customer))
            ->patch(route('customers.update', $customer), [
                'name' => 'Andi Updated',
                'whatsapp' => '0833333333',
                'alternative_whatsapp' => '0844444444',
                'address' => 'Jl. Updated',
            ])
            ->assertRedirect(route('customers.show', $customer));

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'name' => 'Andi Updated',
            'whatsapp' => '0833333333',
            'alternative_whatsapp' => '0844444444',
            'address' => 'Jl. Updated',
        ]);
    }

    public function test_owner_cannot_edit_customer(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $customer = $this->createCustomerWithSale('Andi Customer', '0811111111', 'DD 2301 CST');

        $this->actingAs($owner)
            ->get(route('customers.edit', $customer))
            ->assertForbidden();

        $this->actingAs($owner)
            ->patch(route('customers.update', $customer), [
                'name' => 'Owner Edit',
                'whatsapp' => '0833333333',
                'address' => 'Jl. Owner',
            ])
            ->assertForbidden();
    }

    public function test_authenticated_users_can_download_private_customer_ktp(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $customer = $this->createCustomerWithSale('Andi Customer', '0811111111', 'DD 2301 CST');
        Storage::disk('local')->put($customer->ktp_file_path, 'private ktp');

        $this->get(route('customers.ktp.download', $customer))
            ->assertRedirect('/login');

        $this->actingAs($owner)
            ->get(route('customers.ktp.download', $customer))
            ->assertOk();
    }

    private function createCustomerWithSale(string $name, string $whatsapp, string $plateNumber): Customer
    {
        $brand = VehicleBrand::query()->firstOrCreate(['name' => 'Toyota']);
        $vehicle = Vehicle::query()->create([
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
            'status' => VehicleStatus::Sold->value,
        ]);
        $customer = Customer::query()->create([
            'name' => $name,
            'whatsapp' => $whatsapp,
            'alternative_whatsapp' => null,
            'address' => 'Jl. Customer',
            'ktp_file_path' => "customers/{$whatsapp}/ktp.jpg",
            'ktp_original_name' => 'ktp.jpg',
        ]);
        $employee = Employee::query()->create(['name' => "PIC {$whatsapp}"]);
        $area = Area::query()->create(['name' => "Area {$whatsapp}"]);

        Sale::query()->create([
            'vehicle_id' => $vehicle->id,
            'customer_id' => $customer->id,
            'employee_id' => $employee->id,
            'area_id' => $area->id,
            'sale_date' => '2026-08-08',
            'payment_type' => PaymentType::Cash->value,
            'selling_price' => 150000000,
            'credit_total' => 0,
            'initial_capital_snapshot' => 120000000,
            'vehicle_cost_snapshot' => 1500000,
            'final_capital_snapshot' => 121500000,
            'profit_snapshot' => 28500000,
        ]);

        return $customer;
    }
}
