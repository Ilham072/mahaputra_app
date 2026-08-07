<?php

namespace App\Enums;

enum VehicleStatus: string
{
    case Preparation = 'PREPARATION';
    case Ready = 'READY';
    case Booking = 'BOOKING';
    case Sold = 'SOLD';

    public function label(): string
    {
        return match ($this) {
            self::Preparation => 'Persiapan',
            self::Ready => 'Ready',
            self::Booking => 'Booking',
            self::Sold => 'Terjual',
        };
    }
}
