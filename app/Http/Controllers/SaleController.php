<?php

namespace App\Http\Controllers;

use App\Actions\CreateSaleAction;
use App\Enums\PaymentType;
use App\Http\Requests\SaleRequest;
use App\Models\Area;
use App\Models\Employee;
use App\Models\FinancingProvider;
use App\Models\Sale;
use App\Models\Vehicle;
use App\Services\VehicleCapitalCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SaleController extends Controller
{
    public function __construct(private readonly VehicleCapitalCalculator $capitalCalculator) {}

    public function index(Request $request): Response
    {
        $sales = Sale::query()
            ->with(['vehicle.brand', 'customer', 'employee', 'area'])
            ->latest('sale_date')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Sale $sale): array => $this->summary($sale));

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
        ]);
    }

    public function create(Vehicle $vehicle): Response
    {
        abort_if($vehicle->sale()->exists(), 422, 'Kendaraan sudah terjual.');

        $vehicle->load(['brand', 'collaborator', 'costs']);

        return Inertia::render('Sales/Form', [
            'vehicle' => $this->vehicleSaleContext($vehicle),
            'options' => [
                'areas' => Area::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
                'employees' => Employee::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
                'financingProviders' => FinancingProvider::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
                'paymentTypes' => collect(PaymentType::cases())
                    ->map(fn (PaymentType $type): array => [
                        'value' => $type->value,
                        'label' => $type->label(),
                    ])
                    ->values(),
            ],
        ]);
    }

    public function store(SaleRequest $request, Vehicle $vehicle, CreateSaleAction $action): RedirectResponse
    {
        $sale = $action->execute($vehicle, $request->validated());

        return Redirect::route('sales.show', $sale)
            ->with('success', 'Penjualan berhasil disimpan.');
    }

    public function show(Sale $sale): Response
    {
        $sale->load(['vehicle.brand', 'customer', 'employee', 'area', 'payment.financingProvider']);

        return Inertia::render('Sales/Show', [
            'sale' => $this->detail($sale),
        ]);
    }

    public function invoiceData(Sale $sale): JsonResponse
    {
        $sale->load(['vehicle.brand', 'customer', 'employee', 'area', 'payment.financingProvider']);

        return response()->json([
            'generated_at' => now()->toDateTimeString(),
            'invoice' => [
                'number' => 'INV-'.$sale->sale_date->format('Ymd').'-'.str_pad((string) $sale->id, 5, '0', STR_PAD_LEFT),
                'sale_date' => $sale->sale_date->toDateString(),
                'payment_type' => $sale->payment_type->value,
                'transaction_total' => $sale->payment_type === PaymentType::Credit
                    ? $sale->credit_total
                    : $sale->selling_price,
            ],
            'vehicle' => [
                'brand' => $sale->vehicle->brand?->name,
                'type' => $sale->vehicle->type,
                'plate_number' => $sale->vehicle->plate_number,
                'year' => $sale->vehicle->year,
                'color' => $sale->vehicle->color,
            ],
            'customer' => [
                'name' => $sale->customer->name,
                'whatsapp' => $sale->customer->whatsapp,
                'alternative_whatsapp' => $sale->customer->alternative_whatsapp,
                'address' => $sale->customer->address,
            ],
            'showroom' => [
                'area' => $sale->area->name,
                'employee' => $sale->employee->name,
            ],
            'payment' => [
                'financing_provider' => $sale->payment_type === PaymentType::Credit
                    ? $sale->payment?->financingProvider?->name
                    : null,
                'selling_price' => $sale->selling_price,
                'dp' => $sale->payment_type === PaymentType::Credit ? $sale->payment?->dp ?? 0 : 0,
                'outstanding_dp' => $sale->payment_type === PaymentType::Credit ? $sale->payment?->outstanding_dp ?? 0 : 0,
                'financing_disbursement' => $sale->payment_type === PaymentType::Credit ? $sale->payment?->financing_disbursement ?? 0 : 0,
                'refund' => $sale->payment_type === PaymentType::Credit ? $sale->payment?->refund ?? 0 : 0,
            ],
        ]);
    }

    public function downloadKtp(Sale $sale): StreamedResponse
    {
        $sale->load('customer');

        abort_unless(Storage::disk('local')->exists($sale->customer->ktp_file_path), 404);

        return Storage::disk('local')->download(
            $sale->customer->ktp_file_path,
            $sale->customer->ktp_original_name ?? basename($sale->customer->ktp_file_path),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function vehicleSaleContext(Vehicle $vehicle): array
    {
        $initialCapital = $this->capitalCalculator->initialCapital(
            $vehicle->capital_type,
            $vehicle->showroom_capital,
            $vehicle->collaborator_capital,
        );
        $vehicleCost = $this->capitalCalculator->totalVehicleCost(
            $vehicle->tax_amount,
            (int) $vehicle->costs->sum('amount'),
        );

        return [
            'id' => $vehicle->id,
            'brand' => $vehicle->brand?->name,
            'type' => $vehicle->type,
            'plate_number' => $vehicle->plate_number,
            'asking_price' => $vehicle->asking_price,
            'status' => $vehicle->status->value,
            'initial_capital' => $initialCapital,
            'vehicle_cost' => $vehicleCost,
            'final_capital' => $this->capitalCalculator->finalCapital($initialCapital, $vehicleCost),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function summary(Sale $sale): array
    {
        return [
            'id' => $sale->id,
            'sale_date' => $sale->sale_date->toDateString(),
            'vehicle' => trim(($sale->vehicle->brand?->name ?? '').' '.$sale->vehicle->type),
            'plate_number' => $sale->vehicle->plate_number,
            'customer_name' => $sale->customer->name,
            'area' => $sale->area->name,
            'employee' => $sale->employee->name,
            'payment_type' => $sale->payment_type->value,
            'selling_price' => $sale->selling_price,
            'final_capital_snapshot' => $sale->final_capital_snapshot,
            'profit_snapshot' => $sale->profit_snapshot,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function detail(Sale $sale): array
    {
        return [
            ...$this->summary($sale),
            'vehicle_id' => $sale->vehicle_id,
            'customer' => [
                'name' => $sale->customer->name,
                'whatsapp' => $sale->customer->whatsapp,
                'alternative_whatsapp' => $sale->customer->alternative_whatsapp,
                'address' => $sale->customer->address,
                'ktp_original_name' => $sale->customer->ktp_original_name,
                'ktp_download_url' => route('sales.ktp.download', $sale),
            ],
            'credit_total' => $sale->credit_total,
            'initial_capital_snapshot' => $sale->initial_capital_snapshot,
            'vehicle_cost_snapshot' => $sale->vehicle_cost_snapshot,
            'payment' => [
                'financing_provider' => $sale->payment?->financingProvider?->name,
                'dp' => $sale->payment?->dp ?? 0,
                'outstanding_dp' => $sale->payment?->outstanding_dp ?? 0,
                'financing_disbursement' => $sale->payment?->financing_disbursement ?? 0,
                'refund' => $sale->payment?->refund ?? 0,
            ],
        ];
    }
}
