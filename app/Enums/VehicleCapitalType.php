<?php

namespace App\Enums;

enum VehicleCapitalType: string
{
    case Umum = 'UMUM';
    case Khusus = 'KHUSUS';

    public function label(): string
    {
        return match ($this) {
            self::Umum => 'UMUM',
            self::Khusus => 'KHUSUS',
        };
    }
}
