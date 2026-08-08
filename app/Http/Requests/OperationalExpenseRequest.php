<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OperationalExpenseRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->input('amount') === '') {
            $this->merge(['amount' => null]);
        }
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
            'category_id' => [
                'required',
                'integer',
                Rule::exists('expense_categories', 'id')->where('is_active', true),
            ],
            'transaction_date' => ['required', 'date'],
            'amount' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string', 'max:2000'],
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
        ];
    }
}
