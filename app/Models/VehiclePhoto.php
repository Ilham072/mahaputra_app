<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehiclePhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'file_path',
        'original_name',
        'mime_type',
        'size',
        'is_cover',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'is_cover' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
