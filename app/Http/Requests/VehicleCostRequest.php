<?php

namespace App\Http\Requests;

use App\Enums\VehicleCostCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VehicleCostRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'amount' => $this->input('amount') === null || $this->input('amount') === ''
                ? null
                : $this->input('amount'),
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
        return [
            'cost_date' => ['required', 'date'],
            'category' => ['required', Rule::enum(VehicleCostCategory::class)],
            'amount' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
