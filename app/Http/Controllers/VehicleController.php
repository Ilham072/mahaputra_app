<?php

namespace App\Http\Controllers;

use App\Actions\CreateVehicleAction;
use App\Actions\UpdateVehicleAction;
use App\Enums\VehicleCapitalType;
use App\Enums\VehicleCostCategory;
use App\Enums\VehicleDocumentType;
use App\Enums\VehicleStatus;
use App\Enums\VehicleTaxStatus;
use App\Http\Requests\VehicleRequest;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use App\Services\VehicleCapitalCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function __construct(private readonly VehicleCapitalCalculator $capitalCalculator) {}

    public function index(Request $request): Response
    {
        $vehicles = Vehicle::query()
            ->with(['brand', 'collaborator'])
            ->when($request->string('search')->toString(), function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('plate_number', 'like', "%{$search}%")
                        ->orWhere('type', 'like', "%{$search}%");
                });
            })
            ->when($request->string('status')->toString(), fn ($query, string $status) => $query->where('status', $status))
            ->when($request->integer('brand_id'), fn ($query, int $brandId) => $query->where('brand_id', $brandId))
            ->when($request->string('capital_type')->toString(), fn ($query, string $capitalType) => $query->where('capital_type', $capitalType))
            ->latest('purchase_date')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Vehicle $vehicle): array => $this->summary($vehicle));

        return Inertia::render('Vehicles/Index', [
            'vehicles' => $vehicles,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $request->string('status')->toString(),
                'brand_id' => $request->string('brand_id')->toString(),
                'capital_type' => $request->string('capital_type')->toString(),
            ],
            'options' => $this->options(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Vehicles/Form', [
            'mode' => 'create',
            'vehicle' => null,
            'options' => $this->options(),
        ]);
    }

    public function store(VehicleRequest $request, CreateVehicleAction $action): RedirectResponse
    {
        $vehicle = $action->execute($request->validated());

        return Redirect::route('vehicles.show', $vehicle)
            ->with('success', 'Kendaraan berhasil ditambahkan.');
    }

    public function show(Vehicle $vehicle): Response
    {
        $vehicle->load(['brand', 'collaborator', 'costs', 'documents']);

        return Inertia::render('Vehicles/Show', [
            'vehicle' => $this->detail($vehicle),
            'costCategoryOptions' => collect(VehicleCostCategory::cases())
                ->map(fn (VehicleCostCategory $category): array => [
                    'value' => $category->value,
                    'label' => $category->label(),
                ])
                ->values(),
            'documentTypeOptions' => collect(VehicleDocumentType::cases())
                ->map(fn (VehicleDocumentType $type): array => [
                    'value' => $type->value,
                    'label' => $type->label(),
                ])
                ->values(),
        ]);
    }

    public function edit(Vehicle $vehicle): Response
    {
        $vehicle->load(['brand', 'collaborator']);

        return Inertia::render('Vehicles/Form', [
            'mode' => 'edit',
            'vehicle' => $this->formData($vehicle),
            'options' => $this->options(),
        ]);
    }

    public function update(VehicleRequest $request, Vehicle $vehicle, UpdateVehicleAction $action): RedirectResponse
    {
        $action->execute($vehicle, $request->validated());

        return Redirect::route('vehicles.show', $vehicle)
            ->with('success', 'Kendaraan berhasil diperbarui.');
    }

    /**
     * @return array<string, mixed>
     */
    private function options(): array
    {
        return [
            'brands' => VehicleBrand::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'capitalTypes' => collect(VehicleCapitalType::cases())
                ->map(fn (VehicleCapitalType $type): array => [
                    'value' => $type->value,
                    'label' => $type->label(),
                ])
                ->values(),
            'taxStatuses' => collect(VehicleTaxStatus::cases())
                ->map(fn (VehicleTaxStatus $status): array => [
                    'value' => $status->value,
                    'label' => $status->label(),
                ])
                ->values(),
            'statuses' => collect(VehicleStatus::cases())
                ->map(fn (VehicleStatus $status): array => [
                    'value' => $status->value,
                    'label' => $status->label(),
                ])
                ->values(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function summary(Vehicle $vehicle): array
    {
        return [
            'id' => $vehicle->id,
            'purchase_date' => $vehicle->purchase_date->toDateString(),
            'brand' => $vehicle->brand?->name,
            'type' => $vehicle->type,
            'plate_number' => $vehicle->plate_number,
            'year' => $vehicle->year,
            'color' => $vehicle->color,
            'capital_type' => $vehicle->capital_type->value,
            'asking_price' => $vehicle->asking_price,
            'status' => $vehicle->status->value,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function detail(Vehicle $vehicle): array
    {
        $additionalCostsTotal = $vehicle->costs->sum('amount');
        $initialCapital = $this->capitalCalculator->initialCapital(
            $vehicle->capital_type,
            $vehicle->showroom_capital,
            $vehicle->collaborator_capital,
        );
        $totalVehicleCost = $this->capitalCalculator->totalVehicleCost(
            $vehicle->tax_amount,
            $additionalCostsTotal,
        );

        return [
            ...$this->summary($vehicle),
            'brand_id' => $vehicle->brand_id,
            'showroom_capital' => $vehicle->showroom_capital,
            'collaborator_name' => $vehicle->collaborator?->name,
            'collaborator_capital' => $vehicle->collaborator_capital,
            'tax_status' => $vehicle->tax_status->value,
            'tax_amount' => $vehicle->tax_amount,
            'additional_costs_total' => $additionalCostsTotal,
            'total_vehicle_cost' => $totalVehicleCost,
            'initial_capital' => $initialCapital,
            'final_capital' => $this->capitalCalculator->finalCapital($initialCapital, $totalVehicleCost),
            'costs' => $vehicle->costs
                ->sortByDesc('cost_date')
                ->values()
                ->map(fn ($cost): array => [
                    'id' => $cost->id,
                    'cost_date' => $cost->cost_date->toDateString(),
                    'category' => $cost->category->value,
                    'category_label' => $cost->category->label(),
                    'amount' => $cost->amount,
                    'description' => $cost->description,
                ]),
            'documents' => collect(VehicleDocumentType::cases())
                ->map(function (VehicleDocumentType $type) use ($vehicle): array {
                    $document = $vehicle->documents->first(
                        fn ($document): bool => $document->document_type === $type,
                    );

                    return [
                        'id' => $document?->id,
                        'document_type' => $type->value,
                        'document_label' => $type->label(),
                        'is_available' => $document?->is_available ?? false,
                        'original_name' => $document?->original_name,
                        'mime_type' => $document?->mime_type,
                        'note' => $document?->note,
                        'download_url' => $document?->file_path
                            ? route('vehicles.documents.download', [$vehicle, $document])
                            : null,
                    ];
                })
                ->values(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formData(Vehicle $vehicle): array
    {
        return [
            ...$this->detail($vehicle),
            'collaborator_name' => $vehicle->collaborator?->name ?? '',
        ];
    }
}
