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
}
