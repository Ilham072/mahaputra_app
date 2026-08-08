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
        Schema::create('customers', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 160);
            $table->string('whatsapp', 40);
            $table->string('alternative_whatsapp', 40)->nullable();
            $table->text('address');
            $table->string('ktp_file_path');
            $table->string('ktp_original_name')->nullable();
            $table->string('ktp_mime_type')->nullable();
            $table->timestamps();
        });

        Schema::create('sales', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('vehicle_id')->unique()->constrained()->restrictOnDelete();
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->foreignId('employee_id')->constrained()->restrictOnDelete();
            $table->foreignId('area_id')->constrained()->restrictOnDelete();
            $table->date('sale_date');
            $table->string('payment_type', 20);
            $table->unsignedBigInteger('selling_price');
            $table->unsignedBigInteger('credit_total')->default(0);
            $table->unsignedBigInteger('initial_capital_snapshot');
            $table->unsignedBigInteger('vehicle_cost_snapshot');
            $table->unsignedBigInteger('final_capital_snapshot');
            $table->bigInteger('profit_snapshot');
            $table->timestamps();

            $table->index(['sale_date', 'payment_type']);
            $table->index('area_id');
            $table->index('employee_id');
        });

        Schema::create('sale_payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('sale_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('financing_provider_id')->nullable()->constrained()->restrictOnDelete();
            $table->unsignedBigInteger('dp')->default(0);
            $table->unsignedBigInteger('outstanding_dp')->default(0);
            $table->unsignedBigInteger('financing_disbursement')->default(0);
            $table->unsignedBigInteger('refund')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_payments');
        Schema::dropIfExists('sales');
        Schema::dropIfExists('customers');
    }
};
