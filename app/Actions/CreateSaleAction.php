<?php

namespace App\Actions;

use App\Enums\PaymentType;
use App\Enums\VehicleStatus;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\Vehicle;
use App\Services\SaleProfitCalculator;
use App\Services\VehicleCapitalCalculator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class CreateSaleAction
{
    public function __construct(
        private readonly VehicleCapitalCalculator $capitalCalculator,
        private readonly SaleProfitCalculator $profitCalculator,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Vehicle $vehicle, array $data): Sale
    {
        $storedKtpPath = null;

        try {
            return DB::transaction(function () use ($vehicle, $data, &$storedKtpPath): Sale {
                $vehicle = Vehicle::query()
                    ->with('costs')
                    ->lockForUpdate()
                    ->findOrFail($vehicle->id);

                abort_if($vehicle->status === VehicleStatus::Sold || $vehicle->sale()->exists(), 422, 'Kendaraan sudah terjual.');

                $customer = $this->createCustomer($vehicle, $data, $storedKtpPath);
                $snapshots = $this->snapshots($vehicle);
                $paymentType = PaymentType::from($data['payment_type']);
                $creditTotal = 0;
                $profit = $this->profitCalculator->cashProfit(
                    (int) $data['selling_price'],
                    $snapshots['final_capital_snapshot'],
                );

                if ($paymentType === PaymentType::Credit) {
                    $creditTotal = $this->profitCalculator->creditTotal(
                        (int) $data['dp'],
                        (int) $data['outstanding_dp'],
                        (int) $data['financing_disbursement'],
                        (int) $data['refund'],
                    );
                    $profit = $this->profitCalculator->creditProfit(
                        $creditTotal,
                        $snapshots['final_capital_snapshot'],
                    );
                }

                $sale = Sale::query()->create([
                    'vehicle_id' => $vehicle->id,
                    'customer_id' => $customer->id,
                    'employee_id' => $data['employee_id'],
                    'area_id' => $data['area_id'],
                    'sale_date' => $data['sale_date'],
                    'payment_type' => $paymentType->value,
                    'selling_price' => $data['selling_price'],
                    'credit_total' => $creditTotal,
                    ...$snapshots,
                    'profit_snapshot' => $profit,
                ]);

                $sale->payment()->create([
                    'financing_provider_id' => $paymentType === PaymentType::Credit
                        ? $data['financing_provider_id']
                        : null,
                    'dp' => $paymentType === PaymentType::Credit ? $data['dp'] : 0,
                    'outstanding_dp' => $paymentType === PaymentType::Credit ? $data['outstanding_dp'] : 0,
                    'financing_disbursement' => $paymentType === PaymentType::Credit ? $data['financing_disbursement'] : 0,
                    'refund' => $paymentType === PaymentType::Credit ? $data['refund'] : 0,
                ]);

                $vehicle->update(['status' => VehicleStatus::Sold->value]);

                return $sale->load(['vehicle.brand', 'customer', 'employee', 'area', 'payment.financingProvider']);
            });
        } catch (Throwable $exception) {
            if ($storedKtpPath) {
                Storage::disk('local')->delete($storedKtpPath);
            }

            throw $exception;
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function createCustomer(Vehicle $vehicle, array $data, ?string &$storedKtpPath): Customer
    {
        /** @var UploadedFile $ktp */
        $ktp = $data['customer_ktp'];
        $path = $ktp->store("customers/vehicles/{$vehicle->id}/ktp", 'local');
        $storedKtpPath = $path;

        return Customer::query()->create([
            'name' => $data['customer_name'],
            'whatsapp' => $data['customer_whatsapp'],
            'alternative_whatsapp' => $data['customer_alternative_whatsapp'] ?? null,
            'address' => $data['customer_address'],
            'ktp_file_path' => $path,
            'ktp_original_name' => $ktp->getClientOriginalName(),
            'ktp_mime_type' => $ktp->getMimeType(),
        ]);
    }

    /**
     * @return array{initial_capital_snapshot: int, vehicle_cost_snapshot: int, final_capital_snapshot: int}
     */
    private function snapshots(Vehicle $vehicle): array
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
            'initial_capital_snapshot' => $initialCapital,
            'vehicle_cost_snapshot' => $vehicleCost,
            'final_capital_snapshot' => $this->capitalCalculator->finalCapital($initialCapital, $vehicleCost),
        ];
    }
}
