<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'whatsapp',
        'alternative_whatsapp',
        'address',
        'ktp_file_path',
        'ktp_original_name',
        'ktp_mime_type',
    ];

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
}
