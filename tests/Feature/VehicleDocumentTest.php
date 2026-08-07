<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\VehicleCapitalType;
use App\Enums\VehicleDocumentType;
use App\Enums\VehicleStatus;
use App\Enums\VehicleTaxStatus;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class VehicleDocumentTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_upload_vehicle_document_to_private_storage(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $vehicle = $this->createVehicle();
        $file = UploadedFile::fake()->image('stnk.jpg');

        $this->actingAs($admin)
            ->post(route('vehicles.documents.update', [$vehicle, VehicleDocumentType::Stnk->value]), [
                'is_available' => true,
                'document' => $file,
                'note' => 'STNK asli tersedia.',
            ])
            ->assertRedirect(route('vehicles.show', $vehicle));

        $document = $vehicle->documents()->firstOrFail();

        $this->assertDatabaseHas('vehicle_documents', [
            'vehicle_id' => $vehicle->id,
            'document_type' => VehicleDocumentType::Stnk->value,
            'is_available' => true,
            'original_name' => 'stnk.jpg',
            'note' => 'STNK asli tersedia.',
        ]);

        Storage::disk('local')->assertExists($document->file_path);
        Storage::disk('public')->assertMissing($document->file_path);
    }

    public function test_owner_cannot_upload_vehicle_document(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $vehicle = $this->createVehicle();

        $this->actingAs($owner)
            ->post(route('vehicles.documents.update', [$vehicle, VehicleDocumentType::Bpkb->value]), [
                'is_available' => true,
                'document' => UploadedFile::fake()->create('bpkb.pdf', 100, 'application/pdf'),
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('vehicle_documents', [
            'vehicle_id' => $vehicle->id,
        ]);
    }

    public function test_vehicle_detail_includes_stnk_and_bpkb_document_slots(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $vehicle = $this->createVehicle();

        $vehicle->documents()->create([
            'document_type' => VehicleDocumentType::Stnk->value,
            'is_available' => true,
            'file_path' => 'vehicles/1/documents/stnk.jpg',
            'original_name' => 'stnk.jpg',
            'mime_type' => 'image/jpeg',
            'note' => 'Ada',
        ]);

        $this->actingAs($admin)
            ->get(route('vehicles.show', $vehicle))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Vehicles/Show')
                ->has('vehicle.documents', 2)
                ->where('vehicle.documents.0.document_type', 'STNK')
                ->where('vehicle.documents.0.is_available', true)
                ->where('vehicle.documents.1.document_type', 'BPKB')
                ->where('vehicle.documents.1.is_available', false)
            );
    }

    public function test_authenticated_owner_can_download_private_vehicle_document(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $vehicle = $this->createVehicle();
        $path = 'vehicles/'.$vehicle->id.'/documents/stnk.pdf';
        Storage::disk('local')->put($path, 'private document');

        $document = $vehicle->documents()->create([
            'document_type' => VehicleDocumentType::Stnk->value,
            'is_available' => true,
            'file_path' => $path,
            'original_name' => 'stnk.pdf',
            'mime_type' => 'application/pdf',
        ]);

        $this->actingAs($owner)
            ->get(route('vehicles.documents.download', [$vehicle, $document]))
            ->assertOk();
    }

    public function test_guest_cannot_download_private_vehicle_document(): void
    {
        Storage::fake('local');

        $vehicle = $this->createVehicle();
        $path = 'vehicles/'.$vehicle->id.'/documents/stnk.pdf';
        Storage::disk('local')->put($path, 'private document');

        $document = $vehicle->documents()->create([
            'document_type' => VehicleDocumentType::Stnk->value,
            'is_available' => true,
            'file_path' => $path,
            'original_name' => 'stnk.pdf',
            'mime_type' => 'application/pdf',
        ]);

        $this->get(route('vehicles.documents.download', [$vehicle, $document]))
            ->assertRedirect('/login');
    }

    public function test_vehicle_document_rejects_unsupported_file_type(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $vehicle = $this->createVehicle();

        $this->actingAs($admin)
            ->from(route('vehicles.show', $vehicle))
            ->post(route('vehicles.documents.update', [$vehicle, VehicleDocumentType::Stnk->value]), [
                'is_available' => true,
                'document' => UploadedFile::fake()->create('secret.exe', 10, 'application/octet-stream'),
            ])
            ->assertRedirect(route('vehicles.show', $vehicle))
            ->assertSessionHasErrors('document');
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
            'tax_amount' => 0,
            'asking_price' => 150000000,
            'status' => VehicleStatus::Preparation->value,
        ]);
    }
}
