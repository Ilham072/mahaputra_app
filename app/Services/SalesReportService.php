<?php

namespace App\Services;

use App\Enums\PaymentType;
use App\Enums\VehicleCapitalType;
use App\Models\Area;
use App\Models\Employee;
use App\Models\OperationalExpense;
use App\Models\Sale;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SalesReportService
{
    /**
     * @return array{date_from: string, date_to: string, search: string, area_id: string, employee_id: string, payment_type: string, capital_type: string}
     */
    public function filters(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d'],
            'search' => ['nullable', 'string', 'max:120'],
            'area_id' => ['nullable', 'integer', 'exists:areas,id'],
            'employee_id' => ['nullable', 'integer', 'exists:employees,id'],
            'payment_type' => ['nullable', Rule::enum(PaymentType::class)],
            'capital_type' => ['nullable', Rule::enum(VehicleCapitalType::class)],
        ]);
        $startOfMonth = CarbonImmutable::now()->startOfMonth();
        $endOfMonth = $startOfMonth->endOfMonth();
        $dateFrom = $this->dateOrDefault($validated['date_from'] ?? null, $startOfMonth);
        $dateTo = $this->dateOrDefault($validated['date_to'] ?? null, $endOfMonth);

        if ($dateFrom->greaterThan($dateTo)) {
            [$dateFrom, $dateTo] = [$dateTo, $dateFrom];
        }

        return [
            'date_from' => $dateFrom->toDateString(),
            'date_to' => $dateTo->toDateString(),
            'search' => (string) ($validated['search'] ?? ''),
            'area_id' => (string) ($validated['area_id'] ?? ''),
            'employee_id' => (string) ($validated['employee_id'] ?? ''),
            'payment_type' => (string) ($validated['payment_type'] ?? ''),
            'capital_type' => (string) ($validated['capital_type'] ?? ''),
        ];
    }

    /**
     * @param  array{date_from: string, date_to: string, search: string, area_id: string, employee_id: string, payment_type: string, capital_type: string}  $filters
     */
    public function query(array $filters): Builder
    {
        return Sale::query()
            ->with(['vehicle.brand', 'customer', 'employee', 'area', 'payment.financingProvider'])
            ->whereBetween('sale_date', [$filters['date_from'], $filters['date_to']])
            ->when($filters['search'] !== '', function (Builder $query) use ($filters): void {
                $search = $filters['search'];

                $query->where(function (Builder $query) use ($search): void {
                    $query->whereHas('vehicle', function (Builder $query) use ($search): void {
                        $query->where('plate_number', 'like', "%{$search}%")
                            ->orWhere('type', 'like', "%{$search}%");
                    })->orWhereHas('customer', function (Builder $query) use ($search): void {
                        $query->where('name', 'like', "%{$search}%");
                    });
                });
            })
            ->when($filters['area_id'] !== '', fn (Builder $query): Builder => $query->where('area_id', $filters['area_id']))
            ->when($filters['employee_id'] !== '', fn (Builder $query): Builder => $query->where('employee_id', $filters['employee_id']))
            ->when($filters['payment_type'] !== '', fn (Builder $query): Builder => $query->where('payment_type', $filters['payment_type']))
            ->when($filters['capital_type'] !== '', function (Builder $query) use ($filters): void {
                $query->whereHas('vehicle', fn (Builder $query): Builder => $query->where('capital_type', $filters['capital_type']));
            });
    }

    /**
     * @return array{sales_count: int, sales_value: int, profit_total: int, final_capital_total: int}
     */
    public function summary(Builder $query): array
    {
        $row = $query
            ->toBase()
            ->selectRaw('COUNT(*) as sales_count')
            ->selectRaw('COALESCE(SUM(CASE WHEN payment_type = ? THEN credit_total ELSE selling_price END), 0) as sales_value', [PaymentType::Credit->value])
            ->selectRaw('COALESCE(SUM(profit_snapshot), 0) as profit_total')
            ->selectRaw('COALESCE(SUM(final_capital_snapshot), 0) as final_capital_total')
            ->first();

        return [
            'sales_count' => (int) $row->sales_count,
            'sales_value' => (int) $row->sales_value,
            'profit_total' => (int) $row->profit_total,
            'final_capital_total' => (int) $row->final_capital_total,
        ];
    }

    /**
     * @param  array{date_from: string, date_to: string, search: string, area_id: string, employee_id: string, payment_type: string, capital_type: string}  $filters
     */
    public function operationalTotal(array $filters): int
    {
        return (int) OperationalExpense::query()
            ->whereBetween('transaction_date', [$filters['date_from'], $filters['date_to']])
            ->sum('amount');
    }

    /**
     * @param  array{date_from: string, date_to: string, search: string, area_id: string, employee_id: string, payment_type: string, capital_type: string}  $filters
     */
    public function recentOperations(array $filters): mixed
    {
        return OperationalExpense::query()
            ->with('category')
            ->whereBetween('transaction_date', [$filters['date_from'], $filters['date_to']])
            ->latest('transaction_date')
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(fn (OperationalExpense $expense): array => [
                'id' => $expense->id,
                'transaction_date' => $expense->transaction_date->toDateString(),
                'category' => $expense->category?->name,
                'amount' => $expense->amount,
                'description' => $expense->description,
            ])
            ->values();
    }

    /**
     * @return array<string, mixed>
     */
    public function options(): array
    {
        return [
            'areas' => Area::query()->orderBy('name')->get(['id', 'name']),
            'employees' => Employee::query()->orderBy('name')->get(['id', 'name']),
            'paymentTypes' => collect(PaymentType::cases())
                ->map(fn (PaymentType $type): array => [
                    'value' => $type->value,
                    'label' => $type->label(),
                ])
                ->values(),
            'capitalTypes' => collect(VehicleCapitalType::cases())
                ->map(fn (VehicleCapitalType $type): array => [
                    'value' => $type->value,
                    'label' => $type->label(),
                ])
                ->values(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function saleRow(Sale $sale): array
    {
        return [
            'id' => $sale->id,
            'sale_date' => $sale->sale_date->toDateString(),
            'area' => $sale->area->name,
            'employee' => $sale->employee->name,
            'customer_name' => $sale->customer->name,
            'customer_whatsapp' => $sale->customer->whatsapp,
            'vehicle' => trim(($sale->vehicle->brand?->name ?? '').' '.$sale->vehicle->type),
            'plate_number' => $sale->vehicle->plate_number,
            'year' => $sale->vehicle->year,
            'capital_type' => $sale->vehicle->capital_type->value,
            'purchase_date' => $sale->vehicle->purchase_date->toDateString(),
            'payment_type' => $sale->payment_type->value,
            'financing_provider' => $sale->payment?->financingProvider?->name,
            'selling_price' => $sale->selling_price,
            'credit_total' => $sale->credit_total,
            'dp' => $sale->payment?->dp ?? 0,
            'outstanding_dp' => $sale->payment?->outstanding_dp ?? 0,
            'initial_capital_snapshot' => $sale->initial_capital_snapshot,
            'vehicle_cost_snapshot' => $sale->vehicle_cost_snapshot,
            'final_capital_snapshot' => $sale->final_capital_snapshot,
            'profit_snapshot' => $sale->profit_snapshot,
        ];
    }

    private function dateOrDefault(?string $value, CarbonImmutable $default): CarbonImmutable
    {
        if ($value) {
            return CarbonImmutable::createFromFormat('Y-m-d', $value);
        }

        return $default;
    }
}
