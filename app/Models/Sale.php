<?php

namespace App\Models;

use App\Enums\PaymentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'customer_id',
        'employee_id',
        'area_id',
        'sale_date',
        'payment_type',
        'selling_price',
        'credit_total',
        'initial_capital_snapshot',
        'vehicle_cost_snapshot',
        'final_capital_snapshot',
        'profit_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'sale_date' => 'date',
            'payment_type' => PaymentType::class,
            'selling_price' => 'integer',
            'credit_total' => 'integer',
            'initial_capital_snapshot' => 'integer',
            'vehicle_cost_snapshot' => 'integer',
            'final_capital_snapshot' => 'integer',
            'profit_snapshot' => 'integer',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(SalePayment::class);
    }
}
