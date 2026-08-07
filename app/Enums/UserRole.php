<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Owner = 'owner';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Admin Showroom',
            self::Owner => 'Owner Showroom',
        };
    }
}
