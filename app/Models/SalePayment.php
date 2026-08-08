<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'financing_provider_id',
        'dp',
        'outstanding_dp',
        'financing_disbursement',
        'refund',
    ];

    protected function casts(): array
    {
        return [
            'dp' => 'integer',
            'outstanding_dp' => 'integer',
            'financing_disbursement' => 'integer',
            'refund' => 'integer',
        ];
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function financingProvider(): BelongsTo
    {
        return $this->belongsTo(FinancingProvider::class);
    }
}
