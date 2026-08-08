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
        Schema::create('operational_expenses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained('expense_categories')->restrictOnDelete();
            $table->date('transaction_date')->index();
            $table->unsignedBigInteger('amount');
            $table->text('description')->nullable();
            $table->string('proof_file_path');
            $table->string('proof_original_name')->nullable();
            $table->string('proof_mime_type')->nullable();
            $table->timestamps();

            $table->index(['category_id', 'transaction_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operational_expenses');
    }
};
