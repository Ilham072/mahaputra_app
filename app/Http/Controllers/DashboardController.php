<?php

namespace App\Http\Controllers;

use App\Enums\PaymentType;
use App\Enums\VehicleStatus;
use App\Models\OperationalExpense;
use App\Models\Sale;
use App\Models\Vehicle;
use App\Services\SalesReportService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request, SalesReportService $salesReport): Response
    {
        $periodStart = $this->periodStart($request);
        $periodEnd = $periodStart->endOfMonth();

        $vehicleStatusCounts = Vehicle::query()
            ->select('status', DB::raw('count(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $periodSales = Sale::query()
            ->whereBetween('sale_date', [$periodStart->toDateString(), $periodEnd->toDateString()]);
        $periodSalesSummary = $salesReport->summary(clone $periodSales);

        return Inertia::render('Dashboard', [
            'period' => [
                'month' => $periodStart->format('Y-m'),
                'from' => $periodStart->toDateString(),
                'to' => $periodEnd->toDateString(),
                'label' => $this->monthLabel($periodStart),
            ],
            'metrics' => [
                'vehicles_total' => Vehicle::query()->count(),
                'vehicles_ready' => (int) ($vehicleStatusCounts[VehicleStatus::Ready->value] ?? 0),
                'vehicles_preparation' => (int) ($vehicleStatusCounts[VehicleStatus::Preparation->value] ?? 0),
                'vehicles_booking' => (int) ($vehicleStatusCounts[VehicleStatus::Booking->value] ?? 0),
                'vehicles_sold' => (int) ($vehicleStatusCounts[VehicleStatus::Sold->value] ?? 0),
                'sales_count' => $periodSalesSummary['sales_count'],
                'sales_value' => $periodSalesSummary['sales_value'],
                'vehicle_profit' => $periodSalesSummary['profit_total'],
                'operational_total' => (int) OperationalExpense::query()
                    ->whereBetween('transaction_date', [$periodStart->toDateString(), $periodEnd->toDateString()])
                    ->sum('amount'),
            ],
            'salesTrend' => $this->salesTrend($periodStart),
            'expenseBreakdown' => $this->expenseBreakdown($periodStart, $periodEnd),
            'stockAge' => $this->stockAge($periodEnd),
            'recentSales' => Sale::query()
                ->with(['vehicle.brand', 'customer', 'area'])
                ->whereBetween('sale_date', [$periodStart->toDateString(), $periodEnd->toDateString()])
                ->latest('sale_date')
                ->latest('id')
                ->limit(5)
                ->get()
                ->map(fn (Sale $sale): array => [
                    'id' => $sale->id,
                    'sale_date' => $sale->sale_date->toDateString(),
                    'vehicle' => trim(($sale->vehicle->brand?->name ?? '').' '.$sale->vehicle->type),
                    'plate_number' => $sale->vehicle->plate_number,
                    'customer_name' => $sale->customer->name,
                    'area' => $sale->area->name,
                    'payment_type' => $sale->payment_type->value,
                    'selling_price' => $sale->selling_price,
                    'profit_snapshot' => $sale->profit_snapshot,
                ])
                ->values(),
            'recentVehicles' => Vehicle::query()
                ->with('brand')
                ->whereBetween('purchase_date', [$periodStart->toDateString(), $periodEnd->toDateString()])
                ->latest('purchase_date')
                ->latest('id')
                ->limit(5)
                ->get()
                ->map(fn (Vehicle $vehicle): array => [
                    'id' => $vehicle->id,
                    'vehicle' => trim(($vehicle->brand?->name ?? '').' '.$vehicle->type),
                    'plate_number' => $vehicle->plate_number,
                    'status' => $vehicle->status->value,
                    'asking_price' => $vehicle->asking_price,
                ])
                ->values(),
        ]);
    }

    private function periodStart(Request $request): CarbonImmutable
    {
        $month = $request->string('month')->toString();

        if (preg_match('/^\d{4}-\d{2}$/', $month) === 1) {
            return CarbonImmutable::createFromFormat('Y-m-d', "{$month}-01")->startOfMonth();
        }

        return CarbonImmutable::now()->startOfMonth();
    }

    /**
     * @return list<array{month: string, label: string, sales_count: int, sales_value: int, profit_total: int}>
     */
    private function salesTrend(CarbonImmutable $periodStart): array
    {
        $rangeStart = $periodStart->subMonths(5)->startOfMonth();
        $rangeEnd = $periodStart->endOfMonth();
        $rows = Sale::query()
            ->whereBetween('sale_date', [$rangeStart->toDateString(), $rangeEnd->toDateString()])
            ->selectRaw('substr(sale_date, 1, 7) as month')
            ->selectRaw('COUNT(*) as sales_count')
            ->selectRaw('COALESCE(SUM(CASE WHEN payment_type = ? THEN credit_total ELSE selling_price END), 0) as sales_value', [PaymentType::Credit->value])
            ->selectRaw('COALESCE(SUM(profit_snapshot), 0) as profit_total')
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        return collect(range(5, 0))
            ->map(function (int $offset) use ($periodStart, $rows): array {
                $monthStart = $periodStart->subMonths($offset)->startOfMonth();
                $row = $rows->get($monthStart->format('Y-m'));

                return [
                    'month' => $monthStart->format('Y-m'),
                    'label' => $this->monthLabel($monthStart, true),
                    'sales_count' => (int) ($row?->sales_count ?? 0),
                    'sales_value' => (int) ($row?->sales_value ?? 0),
                    'profit_total' => (int) ($row?->profit_total ?? 0),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return list<array{name: string, total: int, percentage: int}>
     */
    private function expenseBreakdown(CarbonImmutable $periodStart, CarbonImmutable $periodEnd): array
    {
        $rows = OperationalExpense::query()
            ->leftJoin('expense_categories', 'operational_expenses.category_id', '=', 'expense_categories.id')
            ->whereBetween('operational_expenses.transaction_date', [$periodStart->toDateString(), $periodEnd->toDateString()])
            ->selectRaw("COALESCE(expense_categories.name, 'Tanpa Kategori') as name")
            ->selectRaw('COALESCE(SUM(operational_expenses.amount), 0) as total')
            ->groupBy('expense_categories.name')
            ->orderByDesc('total')
            ->limit(4)
            ->get()
            ->map(fn ($row): array => [
                'name' => (string) $row->name,
                'total' => (int) $row->total,
            ]);

        $total = max($rows->sum('total'), 1);

        return $rows
            ->map(fn (array $row): array => [
                'name' => $row['name'],
                'total' => $row['total'],
                'percentage' => (int) round(($row['total'] / $total) * 100),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{label: string, count: int, percentage: int}>
     */
    private function stockAge(CarbonImmutable $periodEnd): array
    {
        $periodEndDate = $periodEnd->toDateString();
        $age30Start = $periodEnd->subDays(30)->toDateString();
        $age31Start = $periodEnd->subDays(60)->toDateString();
        $age31End = $periodEnd->subDays(31)->toDateString();
        $age61Start = $periodEnd->subDays(90)->toDateString();
        $age61End = $periodEnd->subDays(61)->toDateString();
        $ageOver90End = $periodEnd->subDays(91)->toDateString();

        $row = Vehicle::query()
            ->whereIn('status', [
                VehicleStatus::Preparation->value,
                VehicleStatus::Ready->value,
                VehicleStatus::Booking->value,
            ])
            ->whereDate('purchase_date', '<=', $periodEndDate)
            ->selectRaw('COUNT(CASE WHEN purchase_date BETWEEN ? AND ? THEN 1 END) as age_0_30', [$age30Start, $periodEndDate])
            ->selectRaw('COUNT(CASE WHEN purchase_date BETWEEN ? AND ? THEN 1 END) as age_31_60', [$age31Start, $age31End])
            ->selectRaw('COUNT(CASE WHEN purchase_date BETWEEN ? AND ? THEN 1 END) as age_61_90', [$age61Start, $age61End])
            ->selectRaw('COUNT(CASE WHEN purchase_date <= ? THEN 1 END) as age_over_90', [$ageOver90End])
            ->first();

        $buckets = [
            ['label' => '0-30 hari', 'count' => (int) ($row?->age_0_30 ?? 0)],
            ['label' => '31-60 hari', 'count' => (int) ($row?->age_31_60 ?? 0)],
            ['label' => '61-90 hari', 'count' => (int) ($row?->age_61_90 ?? 0)],
            ['label' => '> 90 hari', 'count' => (int) ($row?->age_over_90 ?? 0)],
        ];

        $total = max(collect($buckets)->sum('count'), 1);

        return collect($buckets)
            ->map(fn (array $bucket): array => [
                'label' => $bucket['label'],
                'count' => $bucket['count'],
                'percentage' => (int) round(($bucket['count'] / $total) * 100),
            ])
            ->all();
    }

    private function monthLabel(CarbonImmutable $month, bool $short = false): string
    {
        $labels = $short
            ? [1 => 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
            : [1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        return $labels[(int) $month->format('n')].' '.$month->format('Y');
    }
}
