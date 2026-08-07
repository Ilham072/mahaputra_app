<?php

namespace App\Enums;

enum VehicleDocumentType: string
{
    case Stnk = 'STNK';
    case Bpkb = 'BPKB';

    public function label(): string
    {
        return match ($this) {
            self::Stnk => 'STNK',
            self::Bpkb => 'BPKB',
        };
    }
}
