<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OperationalExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'transaction_date',
        'amount',
        'description',
        'proof_file_path',
        'proof_original_name',
        'proof_mime_type',
    ];

    protected function casts(): array
    {
        return [
            'transaction_date' => 'date',
            'amount' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }
}
