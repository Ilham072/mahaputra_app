<?php

namespace App\Enums;

enum VehicleTaxStatus: string
{
    case On = 'ON';
    case Off = 'OFF';

    public function label(): string
    {
        return match ($this) {
            self::On => 'Pajak ON',
            self::Off => 'Pajak OFF',
        };
    }
}
