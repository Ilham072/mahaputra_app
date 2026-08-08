<?php

namespace Tests\Feature;

use App\Enums\PaymentType;
use App\Enums\UserRole;
use App\Enums\VehicleCapitalType;
use App\Enums\VehicleCostCategory;
use App\Enums\VehicleDocumentType;
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
use Tests\TestCase;

class VehicleInternalPdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_and_owner_can_load_internal_vehicle_pdf_data(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $vehicle = $this->createVehicle();

        $vehicle->costs()->create([
            'cost_date' => '2026-08-09',
            'category' => VehicleCostCategory::Dico->value,
            'amount' => 2500000,
            'description' => 'Dico bumper.',
        ]);

        $vehicle->documents()->create([
            'document_type' => VehicleDocumentType::Stnk->value,
            'is_available' => true,
            'file_path' => 'vehicles/1/documents/stnk.jpg',
            'original_name' => 'stnk.jpg',
            'mime_type' => 'image/jpeg',
            'note' => 'Ada',
        ]);

        $vehicle->photos()->create([
            'file_path' => 'vehicles/1/photos/cover.jpg',
            'original_name' => 'cover.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 100,
            'is_cover' => true,
            'sort_order' => 1,
        ]);

        $this->createSaleForVehicle($vehicle);

        $this->actingAs($admin)
            ->getJson(route('vehicles.pdf-data', $vehicle))
            ->assertOk()
            ->assertJsonPath('vehicle.plate_number', 'DD 2001 PDF')
            ->assertJsonPath('vehicle.initial_capital', 120000000)
            ->assertJsonPath('vehicle.additional_costs_total', 2500000)
            ->assertJsonPath('vehicle.total_vehicle_cost', 4000000)
            ->assertJsonPath('vehicle.final_capital', 124000000)
            ->assertJsonPath('vehicle.photos_count', 1)
            ->assertJsonPath('vehicle.has_cover_photo', true)
            ->assertJsonPath('costs.0.category_label', 'Dico')
            ->assertJsonPath('documents.0.document_type', 'STNK')
            ->assertJsonPath('documents.0.is_available', true)
            ->assertJsonPath('documents.1.document_type', 'BPKB')
            ->assertJsonPath('documents.1.is_available', false)
            ->assertJsonPath('sale.payment_type', PaymentType::Cash->value)
            ->assertJsonMissingPath('documents.0.file_path')
            ->assertJsonMissingPath('vehicle.photos.0.file_path');

        $this->actingAs($owner)
            ->getJson(route('vehicles.pdf-data', $vehicle))
            ->assertOk()
            ->assertJsonPath('vehicle.plate_number', 'DD 2001 PDF');
    }

    public function test_guest_cannot_load_internal_vehicle_pdf_data(): void
    {
        $vehicle = $this->createVehicle();

        $this->getJson(route('vehicles.pdf-data', $vehicle))
            ->assertUnauthorized();
    }

    private function createVehicle(): Vehicle
    {
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);

        return Vehicle::query()->create([
            'purchase_date' => '2026-08-08',
            'brand_id' => $brand->id,
            'type' => 'Avanza',
            'plate_number' => 'DD 2001 PDF',
            'year' => 2022,
            'color' => 'Hitam',
            'capital_type' => VehicleCapitalType::Khusus->value,
            'showroom_capital' => 120000000,
            'tax_status' => VehicleTaxStatus::On->value,
            'tax_amount' => 1500000,
            'asking_price' => 150000000,
            'status' => VehicleStatus::Sold->value,
        ]);
    }

    private function createSaleForVehicle(Vehicle $vehicle): Sale
    {
        $employee = Employee::query()->create(['name' => 'Admin PIC']);
        $area = Area::query()->create(['name' => 'Bone']);
        $customer = Customer::query()->create([
            'name' => 'Pembeli PDF',
            'whatsapp' => '08123456789',
            'address' => 'Jl. Merdeka',
            'ktp_file_path' => 'customer-ktp/test.jpg',
        ]);

        return Sale::query()->create([
            'vehicle_id' => $vehicle->id,
            'customer_id' => $customer->id,
            'employee_id' => $employee->id,
            'area_id' => $area->id,
            'sale_date' => '2026-08-10',
            'payment_type' => PaymentType::Cash->value,
            'selling_price' => 150000000,
            'credit_total' => 0,
            'initial_capital_snapshot' => 120000000,
            'vehicle_cost_snapshot' => 4000000,
            'final_capital_snapshot' => 124000000,
            'profit_snapshot' => 26000000,
        ]);
    }
}
