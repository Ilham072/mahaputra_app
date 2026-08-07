<?php

namespace App\Services;

use App\Enums\VehicleCapitalType;

class VehicleCapitalCalculator
{
    public function initialCapital(
        VehicleCapitalType $capitalType,
        int $showroomCapital,
        int $collaboratorCapital = 0,
    ): int {
        if ($capitalType === VehicleCapitalType::Khusus) {
            return $showroomCapital;
        }

        return $showroomCapital + $collaboratorCapital;
    }

    public function totalVehicleCost(int $taxAmount, int $additionalCosts): int
    {
        return $taxAmount + $additionalCosts;
    }

    public function finalCapital(int $initialCapital, int $totalVehicleCost): int
    {
        return $initialCapital + $totalVehicleCost;
    }
}
