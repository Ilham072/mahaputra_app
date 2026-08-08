<?php

namespace App\Http\Requests;

use App\Enums\PaymentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaleRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        foreach ([
            'selling_price',
            'dp',
            'outstanding_dp',
            'financing_disbursement',
            'refund',
        ] as $field) {
            if ($this->input($field) === '') {
                $this->merge([$field => null]);
            }
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
        $paymentType = (string) $this->input('payment_type');
        $isCredit = $paymentType === PaymentType::Credit->value;
        $isCash = $paymentType === PaymentType::Cash->value;

        return [
            'sale_date' => ['required', 'date'],
            'employee_id' => [
                'required',
                'integer',
                Rule::exists('employees', 'id')->where('is_active', true),
            ],
            'area_id' => [
                'required',
                'integer',
                Rule::exists('areas', 'id')->where('is_active', true),
            ],
            'customer_name' => ['required', 'string', 'max:160'],
            'customer_whatsapp' => ['required', 'string', 'max:40'],
            'customer_alternative_whatsapp' => ['nullable', 'string', 'max:40'],
            'customer_address' => ['required', 'string', 'max:2000'],
            'customer_ktp' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
            'payment_type' => ['required', Rule::enum(PaymentType::class)],
            'selling_price' => ['required', 'integer', 'min:0'],
            'financing_provider_id' => [
                Rule::requiredIf($isCredit),
                'nullable',
                'integer',
                Rule::exists('financing_providers', 'id')->where('is_active', true),
                Rule::prohibitedIf($isCash),
            ],
            'dp' => [
                Rule::requiredIf($isCredit),
                'nullable',
                'integer',
                'min:0',
                Rule::prohibitedIf($isCash),
            ],
            'outstanding_dp' => [
                Rule::requiredIf($isCredit),
                'nullable',
                'integer',
                'min:0',
                Rule::prohibitedIf($isCash),
            ],
            'financing_disbursement' => [
                Rule::requiredIf($isCredit),
                'nullable',
                'integer',
                'min:0',
                Rule::prohibitedIf($isCash),
            ],
            'refund' => [
                Rule::requiredIf($isCredit),
                'nullable',
                'integer',
                'min:0',
                Rule::prohibitedIf($isCash),
            ],
        ];
    }
}
