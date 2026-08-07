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
        Schema::create('collaborators', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 120);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('vehicles', function (Blueprint $table): void {
            $table->id();
            $table->date('purchase_date');
            $table->foreignId('brand_id')->constrained('vehicle_brands')->restrictOnDelete();
            $table->string('type', 120);
            $table->string('plate_number', 24)->unique();
            $table->unsignedSmallInteger('year');
            $table->string('color', 80);
            $table->string('capital_type', 20);
            $table->unsignedBigInteger('showroom_capital');
            $table->foreignId('collaborator_id')->nullable()->constrained('collaborators')->nullOnDelete();
            $table->unsignedBigInteger('collaborator_capital')->default(0);
            $table->string('tax_status', 20);
            $table->unsignedBigInteger('tax_amount')->default(0);
            $table->unsignedBigInteger('asking_price');
            $table->string('status', 30)->index();
            $table->timestamps();

            $table->index(['brand_id', 'status']);
            $table->index('capital_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('collaborators');
    }
};
