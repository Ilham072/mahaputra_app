<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerRequest;
use App\Models\Area;
use App\Models\Customer;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $areaId = $request->string('area_id')->toString();
        $customerStatus = $request->string('customer_status')->toString();

        $customers = Customer::query()
            ->withCount('sales')
            ->withSum('sales as total_purchase', 'selling_price')
            ->withMax('sales', 'sale_date')
            ->with([
                'sales' => fn ($query) => $query
                    ->with('area')
                    ->latest('sale_date')
                    ->latest('id'),
            ])
            ->when($search, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('whatsapp', 'like', "%{$search}%")
                        ->orWhere('alternative_whatsapp', 'like', "%{$search}%");
                });
            })
            ->when($areaId !== '', fn ($query) => $query->whereHas('sales', fn ($query) => $query->where('area_id', $areaId)))
            ->when($customerStatus === 'with_transactions', fn ($query) => $query->has('sales'))
            ->when($customerStatus === 'without_transactions', fn ($query) => $query->doesntHave('sales'))
            ->latest('sales_max_sale_date')
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Customer $customer): array => $this->summary($customer));

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
                'area_id' => $areaId,
                'customer_status' => $customerStatus,
            ],
            'summary' => [
                'total_customers' => Customer::query()->count(),
                'new_customers_this_month' => Customer::query()
                    ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
                    ->count(),
            ],
            'options' => [
                'areas' => Area::query()
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name']),
            ],
        ]);
    }

    public function show(Customer $customer): Response
    {
        $customer
            ->loadCount('sales')
            ->loadSum('sales as total_purchase', 'selling_price')
            ->loadMax('sales', 'sale_date')
            ->load([
                'sales' => fn ($query) => $query
                    ->with(['vehicle.brand', 'employee', 'area', 'payment.financingProvider'])
                    ->latest('sale_date')
                    ->latest('id'),
            ]);

        return Inertia::render('Customers/Show', [
            'customer' => $this->detail($customer),
        ]);
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('Customers/Form', [
            'customer' => $this->formData($customer),
        ]);
    }

    public function update(CustomerRequest $request, Customer $customer): RedirectResponse
    {
        $customer->update($request->validated());

        return Redirect::route('customers.show', $customer)
            ->with('success', 'Data customer berhasil diperbarui.');
    }

    public function downloadKtp(Customer $customer): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($customer->ktp_file_path), 404);

        return Storage::disk('local')->download(
            $customer->ktp_file_path,
            $customer->ktp_original_name ?? basename($customer->ktp_file_path),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function summary(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'whatsapp' => $customer->whatsapp,
            'alternative_whatsapp' => $customer->alternative_whatsapp,
            'address' => $customer->address,
            'sales_count' => $customer->sales_count ?? 0,
            'total_purchase' => (int) ($customer->total_purchase ?? 0),
            'last_sale_date' => $customer->sales_max_sale_date,
            'latest_area' => $customer->sales->first()?->area?->name,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function detail(Customer $customer): array
    {
        return [
            ...$this->summary($customer),
            'ktp_original_name' => $customer->ktp_original_name,
            'ktp_download_url' => route('customers.ktp.download', $customer),
            'sales' => $customer->sales
                ->map(fn (Sale $sale): array => [
                    'id' => $sale->id,
                    'sale_date' => $sale->sale_date->toDateString(),
                    'vehicle' => trim(($sale->vehicle->brand?->name ?? '').' '.$sale->vehicle->type),
                    'plate_number' => $sale->vehicle->plate_number,
                    'year' => $sale->vehicle->year,
                    'area' => $sale->area->name,
                    'employee' => $sale->employee->name,
                    'payment_type' => $sale->payment_type->value,
                    'financing_provider' => $sale->payment?->financingProvider?->name,
                    'selling_price' => $sale->selling_price,
                ])
                ->values(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formData(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'whatsapp' => $customer->whatsapp,
            'alternative_whatsapp' => $customer->alternative_whatsapp,
            'address' => $customer->address,
        ];
    }
}
