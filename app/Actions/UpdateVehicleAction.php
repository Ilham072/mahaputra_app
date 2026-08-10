<?php

namespace App\Actions;

use App\Enums\VehicleCapitalType;
use App\Models\Collaborator;
use App\Models\Vehicle;
use Illuminate\Support\Facades\DB;

class UpdateVehicleAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Vehicle $vehicle, array $data): Vehicle
    {
        return DB::transaction(function () use ($vehicle, $data): Vehicle {
            $collaborator = $this->collaborator($data);

            $vehicle->update([
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

            return $vehicle->refresh();
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function collaborator(array $data): ?Collaborator
    {
        if ($data['capital_type'] !== VehicleCapitalType::Khusus->value) {
            return null;
        }

        return Collaborator::query()->firstOrCreate(
            ['name' => $data['collaborator_name']],
            ['is_active' => true],
        );
    }
}
