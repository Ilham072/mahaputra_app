<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class VehiclePhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'photos' => ['required', 'array', 'min:1', 'max:5'],
            'photos.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $vehicle = $this->route('vehicle');
                $incoming = count($this->file('photos', []));
                $existing = $vehicle?->photos()->count() ?? 0;

                if ($existing + $incoming > 5) {
                    $validator->errors()->add('photos', 'Maksimal 5 foto per kendaraan.');
                }
            },
        ];
    }
}
