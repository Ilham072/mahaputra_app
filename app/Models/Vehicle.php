<?php

namespace App\Models;

use App\Enums\VehicleCapitalType;
use App\Enums\VehicleStatus;
use App\Enums\VehicleTaxStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_date',
        'brand_id',
        'type',
        'plate_number',
        'year',
        'color',
        'capital_type',
        'showroom_capital',
        'collaborator_id',
        'collaborator_capital',
        'tax_status',
        'tax_amount',
        'asking_price',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
            'capital_type' => VehicleCapitalType::class,
            'showroom_capital' => 'integer',
            'collaborator_capital' => 'integer',
            'tax_status' => VehicleTaxStatus::class,
            'tax_amount' => 'integer',
            'asking_price' => 'integer',
            'status' => VehicleStatus::class,
        ];
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(VehicleBrand::class, 'brand_id');
    }

    public function collaborator(): BelongsTo
    {
        return $this->belongsTo(Collaborator::class);
    }

    public function costs(): HasMany
    {
        return $this->hasMany(VehicleCost::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(VehicleDocument::class);
    }

    public function sale(): HasOne
    {
        return $this->hasOne(Sale::class);
    }
}
