<?php

namespace App\Actions;

use App\Models\Vehicle;
use App\Models\VehicleCost;

class AddVehicleCostAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Vehicle $vehicle, array $data): VehicleCost
    {
        return $vehicle->costs()->create([
            'cost_date' => $data['cost_date'],
            'category' => $data['category'],
            'amount' => $data['amount'],
            'description' => $data['description'] ?? null,
        ]);
    }
}
