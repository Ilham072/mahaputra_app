<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach ($this->tables() as $table) {
            Schema::create($table, function (Blueprint $table): void {
                $table->id();
                $table->string('name', 120)->unique();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach (array_reverse($this->tables()) as $table) {
            Schema::dropIfExists($table);
        }
    }

    /**
     * @return array<int, string>
     */
    private function tables(): array
    {
        return [
            'employees',
            'areas',
            'vehicle_brands',
            'financing_providers',
            'expense_categories',
        ];
    }
};
