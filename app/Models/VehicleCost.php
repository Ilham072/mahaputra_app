<?php

namespace App\Models;

use App\Enums\VehicleCostCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleCost extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'cost_date',
        'category',
        'amount',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'cost_date' => 'date',
            'category' => VehicleCostCategory::class,
            'amount' => 'integer',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
