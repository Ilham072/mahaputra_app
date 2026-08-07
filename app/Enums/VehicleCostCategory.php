<?php

namespace App\Enums;

enum VehicleCostCategory: string
{
    case Dico = 'DICO';
    case ElectricalUndercarriage = 'ELECTRICAL_UNDERCARRIAGE';
    case Other = 'OTHER';

    public function label(): string
    {
        return match ($this) {
            self::Dico => 'Dico',
            self::ElectricalUndercarriage => 'Kelistrikan/Kaki-kaki',
            self::Other => 'Biaya Lainnya',
        };
    }
}
