<?php

namespace App\Http\Controllers;

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
                'sales_count' => $periodSalesSummary['sales_count'],
                'sales_value' => $periodSalesSummary['sales_value'],
                'vehicle_profit' => $periodSalesSummary['profit_total'],
                'operational_total' => (int) OperationalExpense::query()
                    ->whereBetween('transaction_date', [$periodStart->toDateString(), $periodEnd->toDateString()])
                    ->sum('amount'),
            ],
            'salesTrend' => $this->salesTrend($periodStart, $salesReport),
            'recentSales' => Sale::query()
                ->with(['vehicle.brand', 'customer', 'area'])
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
                ->latest('created_at')
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
    private function salesTrend(CarbonImmutable $periodStart, SalesReportService $salesReport): array
    {
        return collect(range(5, 0))
            ->map(function (int $offset) use ($periodStart, $salesReport): array {
                $monthStart = $periodStart->subMonths($offset)->startOfMonth();
                $monthEnd = $monthStart->endOfMonth();
                $sales = Sale::query()
                    ->whereBetween('sale_date', [$monthStart->toDateString(), $monthEnd->toDateString()]);
                $summary = $salesReport->summary($sales);

                return [
                    'month' => $monthStart->format('Y-m'),
                    'label' => $this->monthLabel($monthStart, true),
                    'sales_count' => $summary['sales_count'],
                    'sales_value' => $summary['sales_value'],
                    'profit_total' => $summary['profit_total'],
                ];
            })
            ->values()
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
