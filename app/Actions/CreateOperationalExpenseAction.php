<?php

namespace App\Actions;

use App\Models\OperationalExpense;
use Illuminate\Http\UploadedFile;

class CreateOperationalExpenseAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data): OperationalExpense
    {
        /** @var UploadedFile $proof */
        $proof = $data['proof'];
        $path = $proof->store('operational-expenses/proofs', 'local');

        return OperationalExpense::query()->create([
            'category_id' => $data['category_id'],
            'transaction_date' => $data['transaction_date'],
            'amount' => $data['amount'],
            'description' => $data['description'] ?? null,
            'proof_file_path' => $path,
            'proof_original_name' => $proof->getClientOriginalName(),
            'proof_mime_type' => $proof->getMimeType(),
        ]);
    }
}
