<?php

namespace App\Http\Controllers;

use App\Actions\CreateOperationalExpenseAction;
use App\Http\Requests\OperationalExpenseRequest;
use App\Models\ExpenseCategory;
use App\Models\OperationalExpense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OperationalExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $query = OperationalExpense::query()
            ->with('category')
            ->when($request->string('date_from')->toString(), fn ($query, string $date) => $query->whereDate('transaction_date', '>=', $date))
            ->when($request->string('date_to')->toString(), fn ($query, string $date) => $query->whereDate('transaction_date', '<=', $date))
            ->when($request->integer('category_id'), fn ($query, int $categoryId) => $query->where('category_id', $categoryId));

        $monthTotal = OperationalExpense::query()
            ->whereBetween('transaction_date', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
            ->sum('amount');

        $filteredTotal = (clone $query)->sum('amount');

        return Inertia::render('Operations/Index', [
            'expenses' => $query
                ->latest('transaction_date')
                ->paginate(15)
                ->withQueryString()
                ->through(fn (OperationalExpense $expense): array => [
                    'id' => $expense->id,
                    'transaction_date' => $expense->transaction_date->toDateString(),
                    'category' => $expense->category?->name,
                    'amount' => $expense->amount,
                    'description' => $expense->description,
                    'proof_original_name' => $expense->proof_original_name,
                    'proof_download_url' => route('operations.proof.download', $expense),
                ]),
            'filters' => [
                'date_from' => $request->string('date_from')->toString(),
                'date_to' => $request->string('date_to')->toString(),
                'category_id' => $request->string('category_id')->toString(),
            ],
            'summary' => [
                'month_total' => $monthTotal,
                'filtered_total' => $filteredTotal,
            ],
            'categories' => ExpenseCategory::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(
        OperationalExpenseRequest $request,
        CreateOperationalExpenseAction $action,
    ): RedirectResponse {
        $action->execute($request->validated());

        return Redirect::route('operations.index')
            ->with('success', 'Transaksi operasional berhasil ditambahkan.');
    }

    public function downloadProof(OperationalExpense $expense): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($expense->proof_file_path), 404);

        return Storage::disk('local')->download(
            $expense->proof_file_path,
            $expense->proof_original_name ?? basename($expense->proof_file_path),
        );
    }
}
