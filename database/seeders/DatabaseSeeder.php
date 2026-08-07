<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        User::query()->updateOrCreate([
            'email' => 'admin@mahaputra.local',
        ], [
            'name' => 'Admin Showroom',
            'role' => UserRole::Admin->value,
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        User::query()->updateOrCreate([
            'email' => 'owner@mahaputra.local',
        ], [
            'name' => 'Owner Showroom',
            'role' => UserRole::Owner->value,
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
    }
}
