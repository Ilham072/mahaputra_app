<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:160'],
            'whatsapp' => ['required', 'string', 'max:40'],
            'alternative_whatsapp' => ['nullable', 'string', 'max:40'],
            'address' => ['required', 'string', 'max:2000'],
        ];
    }
}
