<?php

namespace App\Http\Controllers;

use App\Actions\ExportSalesReportAction;
use App\Models\Sale;
use App\Services\SalesReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    public function index(Request $request, SalesReportService $reports): Response
    {
        $filters = $reports->filters($request);
        $salesQuery = $reports->query($filters);
        $periodOperationalTotal = $reports->operationalTotal($filters);

        $summary = $reports->summary(clone $salesQuery);
        $dashboard = $reports->dashboardData(clone $salesQuery);

        return Inertia::render('Reports/Index', [
            'filters' => $filters,
            'summary' => [
                ...$summary,
                'operational_total' => (int) $periodOperationalTotal,
                'profit_minus_operational' => $summary['profit_total'] - (int) $periodOperationalTotal,
            ],
            'dashboard' => $dashboard,
            'sales' => $salesQuery
                ->latest('sale_date')
                ->latest('id')
                ->paginate(15)
                ->withQueryString()
                ->through(fn (Sale $sale): array => $reports->saleRow($sale)),
            'operations' => [
                'total' => (int) $periodOperationalTotal,
                'recent' => $reports->recentOperations($filters),
            ],
            'options' => $reports->options(),
        ]);
    }

    public function recap(Request $request, SalesReportService $reports): Response
    {
        $filters = $reports->filters($request);
        $salesQuery = $reports->query($filters);
        $periodOperationalTotal = $reports->operationalTotal($filters);
        $summary = $reports->summary(clone $salesQuery);

        return Inertia::render('Reports/Recap', [
            'filters' => $filters,
            'summary' => [
                ...$summary,
                'operational_total' => (int) $periodOperationalTotal,
                'profit_minus_operational' => $summary['profit_total'] - (int) $periodOperationalTotal,
            ],
            'sales' => $salesQuery
                ->latest('sale_date')
                ->latest('id')
                ->paginate(15)
                ->withQueryString()
                ->through(fn (Sale $sale): array => $reports->saleRow($sale)),
            'operations' => [
                'total' => (int) $periodOperationalTotal,
                'recent' => $reports->recentOperations($filters),
            ],
            'options' => $reports->options(),
        ]);
    }

    public function exportExcel(
        Request $request,
        SalesReportService $reports,
        ExportSalesReportAction $export,
    ): BinaryFileResponse {
        $filters = $reports->filters($request);
        $salesQuery = $reports->query($filters);
        $summary = $reports->summary(clone $salesQuery);
        $operationalTotal = $reports->operationalTotal($filters);
        $rows = $salesQuery
            ->oldest('sale_date')
            ->oldest('id')
            ->get()
            ->map(fn (Sale $sale): array => $reports->saleRow($sale))
            ->values()
            ->all();

        $path = $export->execute(
            filters: $filters,
            summary: [
                ...$summary,
                'operational_total' => $operationalTotal,
                'profit_minus_operational' => $summary['profit_total'] - $operationalTotal,
            ],
            rows: $rows,
        );

        return response()
            ->download($path, 'laporan-penjualan-'.$filters['date_from'].'-'.$filters['date_to'].'.xlsx')
            ->deleteFileAfterSend();
    }

    public function exportPdfData(Request $request, SalesReportService $reports): JsonResponse
    {
        $filters = $reports->filters($request);
        $salesQuery = $reports->query($filters);
        $summary = $reports->summary(clone $salesQuery);
        $operationalTotal = $reports->operationalTotal($filters);

        return response()->json([
            'filters' => $filters,
            'summary' => [
                ...$summary,
                'operational_total' => $operationalTotal,
                'profit_minus_operational' => $summary['profit_total'] - $operationalTotal,
            ],
            'rows' => $salesQuery
                ->oldest('sale_date')
                ->oldest('id')
                ->get()
                ->map(fn (Sale $sale): array => $reports->saleRow($sale))
                ->values(),
            'generated_at' => now()->toDateTimeString(),
        ]);
    }
}
