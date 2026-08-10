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
        $dateFrom = $request->string('date_from')->toString() ?: now()->startOfMonth()->toDateString();
        $dateTo = $request->string('date_to')->toString() ?: now()->endOfMonth()->toDateString();
        $search = $request->string('search')->toString();
        $categoryId = $request->string('category_id')->toString();

        $query = OperationalExpense::query()
            ->with('category')
            ->whereDate('transaction_date', '>=', $dateFrom)
            ->whereDate('transaction_date', '<=', $dateTo)
            ->when($categoryId !== '', fn ($query) => $query->where('category_id', $categoryId))
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('description', 'like', "%{$search}%")
                        ->orWhereHas('category', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                });
            });

        $monthTotal = OperationalExpense::query()
            ->whereBetween('transaction_date', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
            ->sum('amount');

        $filteredTotal = (clone $query)->sum('amount');
        $filteredCount = (clone $query)->count();

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
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'search' => $search,
                'category_id' => $categoryId,
            ],
            'summary' => [
                'month_total' => $monthTotal,
                'filtered_total' => $filteredTotal,
                'transaction_count' => $filteredCount,
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
