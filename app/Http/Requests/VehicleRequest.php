<?php

namespace App\Http\Requests;

use App\Enums\VehicleCapitalType;
use App\Enums\VehicleStatus;
use App\Enums\VehicleTaxStatus;
use App\Models\Vehicle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VehicleRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'plate_number' => strtoupper((string) $this->input('plate_number')),
            'tax_amount' => $this->input('tax_amount') === null || $this->input('tax_amount') === ''
                ? 0
                : $this->input('tax_amount'),
        ]);
    }

    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $vehicle = $this->route('vehicle');
        $vehicleId = $vehicle instanceof Vehicle ? $vehicle->id : null;
        $hasSale = $vehicle instanceof Vehicle && $vehicle->sale()->exists();
        $capitalType = (string) $this->input('capital_type');
        $statusRules = ['required', Rule::enum(VehicleStatus::class)];

        if ($hasSale) {
            $statusRules[] = Rule::in([VehicleStatus::Sold->value]);
        } else {
            $statusRules[] = Rule::notIn([VehicleStatus::Sold->value]);
        }

        return [
            'purchase_date' => ['required', 'date'],
            'brand_id' => [
                'required',
                'integer',
                Rule::exists('vehicle_brands', 'id')->where('is_active', true),
            ],
            'type' => ['required', 'string', 'max:120'],
            'plate_number' => [
                'required',
                'string',
                'max:24',
                Rule::unique('vehicles', 'plate_number')->ignore($vehicleId),
            ],
            'year' => ['required', 'integer', 'min:1980', 'max:'.((int) now()->format('Y') + 1)],
            'color' => ['required', 'string', 'max:80'],
            'capital_type' => ['required', Rule::enum(VehicleCapitalType::class)],
            'showroom_capital' => ['required', 'integer', 'min:0'],
            'collaborator_name' => [
                Rule::requiredIf($capitalType === VehicleCapitalType::Umum->value),
                'nullable',
                'string',
                'max:120',
                Rule::prohibitedIf($capitalType === VehicleCapitalType::Khusus->value),
            ],
            'collaborator_capital' => [
                Rule::requiredIf($capitalType === VehicleCapitalType::Umum->value),
                'nullable',
                'integer',
                'min:1',
                Rule::prohibitedIf($capitalType === VehicleCapitalType::Khusus->value),
            ],
            'tax_status' => ['required', Rule::enum(VehicleTaxStatus::class)],
            'tax_amount' => ['nullable', 'integer', 'min:0'],
            'asking_price' => ['required', 'integer', 'min:0'],
            'status' => $statusRules,
            'photos' => ['nullable', 'array', 'max:5'],
            'photos.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
