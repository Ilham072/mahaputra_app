<?php

namespace App\Actions;

use App\Enums\VehicleCapitalType;
use App\Models\Collaborator;
use App\Models\Vehicle;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class CreateVehicleAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data): Vehicle
    {
        $storedPaths = [];

        try {
            return DB::transaction(function () use ($data, &$storedPaths): Vehicle {
                $collaborator = $this->collaborator($data);

                $vehicle = Vehicle::query()->create([
                    'purchase_date' => $data['purchase_date'],
                    'brand_id' => $data['brand_id'],
                    'type' => $data['type'],
                    'plate_number' => strtoupper($data['plate_number']),
                    'year' => $data['year'],
                    'color' => $data['color'],
                    'capital_type' => $data['capital_type'],
                    'showroom_capital' => $data['showroom_capital'],
                    'collaborator_id' => $collaborator?->id,
                    'collaborator_capital' => $collaborator ? $data['collaborator_capital'] : 0,
                    'tax_status' => $data['tax_status'],
                    'tax_amount' => $data['tax_amount'] ?? 0,
                    'asking_price' => $data['asking_price'],
                    'status' => $data['status'],
                ]);

                $this->storePhotos($vehicle, $data['photos'] ?? [], $storedPaths);

                return $vehicle;
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($storedPaths);

            throw $exception;
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function collaborator(array $data): ?Collaborator
    {
        if ($data['capital_type'] !== VehicleCapitalType::Umum->value) {
            return null;
        }

        return Collaborator::query()->firstOrCreate(
            ['name' => $data['collaborator_name']],
            ['is_active' => true],
        );
    }

    /**
     * @param  array<int, UploadedFile>  $photos
     * @param  array<int, string>  $storedPaths
     */
    private function storePhotos(Vehicle $vehicle, array $photos, array &$storedPaths): void
    {
        foreach ($photos as $index => $photo) {
            $path = $photo->store("vehicles/{$vehicle->id}/photos", 'local');
            $storedPaths[] = $path;

            $vehicle->photos()->create([
                'file_path' => $path,
                'original_name' => $photo->getClientOriginalName(),
                'mime_type' => $photo->getMimeType(),
                'size' => $photo->getSize() ?: 0,
                'is_cover' => $index === 0,
                'sort_order' => $index + 1,
            ]);
        }
    }
}
