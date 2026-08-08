<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\VehicleCapitalType;
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

class VehiclePhotoTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_vehicle_with_private_cover_photo(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);

        $this->actingAs($admin)
            ->post(route('vehicles.store'), [
                ...$this->vehiclePayload(['brand_id' => $brand->id]),
                'photos' => [
                    UploadedFile::fake()->image('avanza.jpg'),
                ],
            ])
            ->assertRedirect();

        $vehicle = Vehicle::query()->where('plate_number', 'DD 1234 XX')->firstOrFail();
        $photo = $vehicle->photos()->firstOrFail();

        $this->assertTrue($photo->is_cover);
        $this->assertSame('avanza.jpg', $photo->original_name);
        Storage::disk('local')->assertExists($photo->file_path);
        Storage::disk('public')->assertMissing($photo->file_path);
    }

    public function test_admin_can_upload_photos_and_set_cover(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $vehicle = $this->createVehicle();

        $this->actingAs($admin)
            ->post(route('vehicles.photos.store', $vehicle), [
                'photos' => [
                    UploadedFile::fake()->image('front.jpg'),
                    UploadedFile::fake()->image('side.jpg'),
                ],
            ])
            ->assertRedirect(route('vehicles.show', $vehicle));

        $front = $vehicle->photos()->where('original_name', 'front.jpg')->firstOrFail();
        $side = $vehicle->photos()->where('original_name', 'side.jpg')->firstOrFail();

        $this->assertTrue($front->is_cover);
        $this->assertFalse($side->is_cover);

        $this->actingAs($admin)
            ->patch(route('vehicles.photos.cover', [$vehicle, $side]))
            ->assertRedirect(route('vehicles.show', $vehicle));

        $this->assertFalse($front->refresh()->is_cover);
        $this->assertTrue($side->refresh()->is_cover);
    }

    public function test_vehicle_index_and_detail_include_photo_urls(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $vehicle = $this->createVehicle();
        $path = 'vehicles/'.$vehicle->id.'/photos/cover.jpg';
        Storage::disk('local')->put($path, 'photo');

        $vehicle->photos()->create([
            'file_path' => $path,
            'original_name' => 'cover.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 5,
            'is_cover' => true,
            'sort_order' => 1,
        ]);

        $this->actingAs($owner)
            ->get(route('vehicles.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Vehicles/Index')
                ->where('vehicles.data.0.cover_photo_url', route('vehicles.photos.show', [$vehicle, $vehicle->photos()->first()]))
            );

        $this->actingAs($owner)
            ->get(route('vehicles.show', $vehicle))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Vehicles/Show')
                ->has('vehicle.photos', 1)
                ->where('vehicle.photos.0.is_cover', true)
            );
    }

    public function test_authenticated_user_can_view_private_vehicle_photo(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $vehicle = $this->createVehicle();
        $path = 'vehicles/'.$vehicle->id.'/photos/cover.jpg';
        Storage::disk('local')->put($path, 'private photo');

        $photo = $vehicle->photos()->create([
            'file_path' => $path,
            'original_name' => 'cover.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 13,
            'is_cover' => true,
            'sort_order' => 1,
        ]);

        $this->actingAs($owner)
            ->get(route('vehicles.photos.show', [$vehicle, $photo]))
            ->assertOk();
    }

    public function test_owner_cannot_manage_vehicle_photos(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create(['role' => UserRole::Owner->value]);
        $vehicle = $this->createVehicle();

        $this->actingAs($owner)
            ->post(route('vehicles.photos.store', $vehicle), [
                'photos' => [
                    UploadedFile::fake()->image('front.jpg'),
                ],
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('vehicle_photos', [
            'vehicle_id' => $vehicle->id,
        ]);
    }

    public function test_deleting_cover_photo_promotes_next_photo_and_deletes_private_file(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $vehicle = $this->createVehicle();
        $firstPath = 'vehicles/'.$vehicle->id.'/photos/first.jpg';
        $secondPath = 'vehicles/'.$vehicle->id.'/photos/second.jpg';
        Storage::disk('local')->put($firstPath, 'first');
        Storage::disk('local')->put($secondPath, 'second');

        $first = $vehicle->photos()->create([
            'file_path' => $firstPath,
            'original_name' => 'first.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 5,
            'is_cover' => true,
            'sort_order' => 1,
        ]);
        $second = $vehicle->photos()->create([
            'file_path' => $secondPath,
            'original_name' => 'second.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 6,
            'is_cover' => false,
            'sort_order' => 2,
        ]);

        $this->actingAs($admin)
            ->delete(route('vehicles.photos.destroy', [$vehicle, $first]))
            ->assertRedirect(route('vehicles.show', $vehicle));

        Storage::disk('local')->assertMissing($firstPath);
        Storage::disk('local')->assertExists($secondPath);
        $this->assertTrue($second->refresh()->is_cover);
    }

    public function test_vehicle_photo_upload_is_limited_to_five_images(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $vehicle = $this->createVehicle();

        foreach (range(1, 4) as $index) {
            $vehicle->photos()->create([
                'file_path' => "vehicles/{$vehicle->id}/photos/existing-{$index}.jpg",
                'original_name' => "existing-{$index}.jpg",
                'mime_type' => 'image/jpeg',
                'size' => 5,
                'is_cover' => $index === 1,
                'sort_order' => $index,
            ]);
        }

        $this->actingAs($admin)
            ->from(route('vehicles.show', $vehicle))
            ->post(route('vehicles.photos.store', $vehicle), [
                'photos' => [
                    UploadedFile::fake()->image('new-a.jpg'),
                    UploadedFile::fake()->image('new-b.jpg'),
                ],
            ])
            ->assertRedirect(route('vehicles.show', $vehicle))
            ->assertSessionHasErrors('photos');
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
            'capital_type' => VehicleCapitalType::Khusus->value,
            'showroom_capital' => 120000000,
            'tax_status' => VehicleTaxStatus::On->value,
            'tax_amount' => 0,
            'asking_price' => 150000000,
            'status' => VehicleStatus::Preparation->value,
            ...$overrides,
        ];
    }

    private function createVehicle(): Vehicle
    {
        $brand = VehicleBrand::query()->create(['name' => 'Toyota']);

        return Vehicle::query()->create($this->vehiclePayload([
            'brand_id' => $brand->id,
        ]));
    }
}
