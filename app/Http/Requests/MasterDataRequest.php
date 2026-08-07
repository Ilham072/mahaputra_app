<?php

namespace App\Http\Requests;

use App\Services\MasterDataService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MasterDataRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(MasterDataService $masterData): array
    {
        $resource = (string) $this->route('resource');
        $id = $this->route('id');
        $model = $masterData->definition($resource)['model'];
        $table = (new $model)->getTable();

        return [
            'name' => [
                'required',
                'string',
                'max:120',
                Rule::unique($table, 'name')->ignore($id),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
