<?php

namespace App\Enums;

enum PaymentType: string
{
    case Cash = 'CASH';
    case Credit = 'CREDIT';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Cash',
            self::Credit => 'Kredit',
        };
    }
}
