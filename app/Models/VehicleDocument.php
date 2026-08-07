<?php

namespace App\Models;

use App\Enums\VehicleDocumentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'document_type',
        'is_available',
        'file_path',
        'original_name',
        'mime_type',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'document_type' => VehicleDocumentType::class,
            'is_available' => 'boolean',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
