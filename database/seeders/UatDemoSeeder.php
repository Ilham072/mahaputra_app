<?php

namespace Database\Seeders;

use App\Enums\PaymentType;
use App\Enums\UserRole;
use App\Enums\VehicleCapitalType;
use App\Enums\VehicleCostCategory;
use App\Enums\VehicleDocumentType;
use App\Enums\VehicleStatus;
use App\Enums\VehicleTaxStatus;
use App\Models\Area;
use App\Models\Collaborator;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\ExpenseCategory;
use App\Models\FinancingProvider;
use App\Models\OperationalExpense;
use App\Models\Sale;
use App\Models\SalePayment;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use App\Models\VehicleCost;
use App\Models\VehicleDocument;
use App\Models\VehiclePhoto;
use App\Services\SaleProfitCalculator;
use App\Services\VehicleCapitalCalculator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UatDemoSeeder extends Seeder
{
    private VehicleCapitalCalculator $capitalCalculator;

    private SaleProfitCalculator $profitCalculator;

    public function __construct()
    {
        $this->capitalCalculator = app(VehicleCapitalCalculator::class);
        $this->profitCalculator = app(SaleProfitCalculator::class);
    }

    /**
     * Seed deterministic local data for manual UAT flows.
     */
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $this->seedUsers();

        $toyota = $this->master(VehicleBrand::class, 'Toyota');
        $honda = $this->master(VehicleBrand::class, 'Honda');
        $suzuki = $this->master(VehicleBrand::class, 'Suzuki');
        $areaBone = $this->master(Area::class, 'Bone');
        $areaMakassar = $this->master(Area::class, 'Makassar');
        $salesPic = $this->master(Employee::class, 'Andi UAT');
        $operationalCategory = $this->master(ExpenseCategory::class, 'Operasional UAT');
        $adira = $this->master(FinancingProvider::class, 'Adira');
        $collaborator = $this->master(Collaborator::class, 'Kolaborator UAT');

        $this->seedReadyCashVehicle($toyota);
        $this->seedReadyCreditVehicle($honda, $collaborator);
        $this->seedPreparationVehicle($suzuki);
        $this->seedSoldCashVehicle($toyota, $areaBone, $salesPic);
        $this->seedSoldCreditVehicle($honda, $areaMakassar, $salesPic, $adira, $collaborator);
        $this->seedOperationalExpense($operationalCategory);
    }

    private function seedUsers(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@mahaputra.local'],
            [
                'name' => 'Admin Showroom',
                'role' => UserRole::Admin->value,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'owner@mahaputra.local'],
            [
                'name' => 'Owner Showroom',
                'role' => UserRole::Owner->value,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );
    }

    /**
     * @template T of \Illuminate\Database\Eloquent\Model
     *
     * @param  class-string<T>  $model
     * @return T
     */
    private function master(string $model, string $name)
    {
        return $model::query()->updateOrCreate(
            ['name' => $name],
            ['is_active' => true],
        );
    }

    private function seedReadyCashVehicle(VehicleBrand $brand): void
    {
        $vehicle = Vehicle::query()->updateOrCreate(
            ['plate_number' => 'DD 1801 UAT'],
            [
                'purchase_date' => '2026-08-01',
                'brand_id' => $brand->id,
                'type' => 'Avanza G',
                'year' => 2021,
                'color' => 'Hitam',
                'capital_type' => VehicleCapitalType::Khusus->value,
                'showroom_capital' => 132000000,
                'collaborator_id' => null,
                'collaborator_capital' => 0,
                'tax_status' => VehicleTaxStatus::On->value,
                'tax_amount' => 1200000,
                'asking_price' => 158000000,
                'status' => VehicleStatus::Ready->value,
            ],
        );

        $this->syncCost($vehicle, VehicleCostCategory::Dico, 1800000, 'UAT dico kendaraan siap cash', '2026-08-02');
        $this->syncDocument($vehicle, VehicleDocumentType::Stnk, 'uat/vehicles/DD-1801-UAT/stnk.txt');
        $this->syncDocument($vehicle, VehicleDocumentType::Bpkb, 'uat/vehicles/DD-1801-UAT/bpkb.txt');
        $this->syncPhoto($vehicle, 'uat/vehicles/DD-1801-UAT/cover.png');
    }

    private function seedReadyCreditVehicle(VehicleBrand $brand, Collaborator $collaborator): void
    {
        $vehicle = Vehicle::query()->updateOrCreate(
            ['plate_number' => 'DD 1802 UAT'],
            [
                'purchase_date' => '2026-08-02',
                'brand_id' => $brand->id,
                'type' => 'Brio Satya',
                'year' => 2022,
                'color' => 'Putih',
                'capital_type' => VehicleCapitalType::Umum->value,
                'showroom_capital' => 90000000,
                'collaborator_id' => $collaborator->id,
                'collaborator_capital' => 36000000,
                'tax_status' => VehicleTaxStatus::On->value,
                'tax_amount' => 1000000,
                'asking_price' => 148000000,
                'status' => VehicleStatus::Ready->value,
            ],
        );

        $this->syncCost($vehicle, VehicleCostCategory::ElectricalUndercarriage, 2200000, 'UAT servis kaki-kaki siap kredit', '2026-08-03');
        $this->syncDocument($vehicle, VehicleDocumentType::Stnk, 'uat/vehicles/DD-1802-UAT/stnk.txt');
        $this->syncPhoto($vehicle, 'uat/vehicles/DD-1802-UAT/cover.png');
    }

    private function seedPreparationVehicle(VehicleBrand $brand): void
    {
        Vehicle::query()->updateOrCreate(
            ['plate_number' => 'DD 1803 UAT'],
            [
                'purchase_date' => '2026-08-04',
                'brand_id' => $brand->id,
                'type' => 'Ertiga GX',
                'year' => 2020,
                'color' => 'Abu-abu',
                'capital_type' => VehicleCapitalType::Khusus->value,
                'showroom_capital' => 118000000,
                'collaborator_id' => null,
                'collaborator_capital' => 0,
                'tax_status' => VehicleTaxStatus::Off->value,
                'tax_amount' => 2500000,
                'asking_price' => 142000000,
                'status' => VehicleStatus::Preparation->value,
            ],
        );
    }

    private function seedSoldCashVehicle(VehicleBrand $brand, Area $area, Employee $employee): void
    {
        $vehicle = Vehicle::query()->updateOrCreate(
            ['plate_number' => 'DD 1804 UAT'],
            [
                'purchase_date' => '2026-07-20',
                'brand_id' => $brand->id,
                'type' => 'Rush TRD',
                'year' => 2020,
                'color' => 'Merah',
                'capital_type' => VehicleCapitalType::Khusus->value,
                'showroom_capital' => 120000000,
                'collaborator_id' => null,
                'collaborator_capital' => 0,
                'tax_status' => VehicleTaxStatus::On->value,
                'tax_amount' => 1500000,
                'asking_price' => 155000000,
                'status' => VehicleStatus::Sold->value,
            ],
        );

        $this->syncCost($vehicle, VehicleCostCategory::Dico, 2000000, 'UAT dico kendaraan cash terjual', '2026-07-22');
        $this->syncPhoto($vehicle, 'uat/vehicles/DD-1804-UAT/cover.png');

        $customer = $this->syncCustomer(
            'Customer Cash UAT',
            '628111801804',
            'Jl. UAT Cash No. 18',
            'uat/customers/cash-uat/ktp.txt',
        );

        $snapshots = $this->snapshots($vehicle);
        $sellingPrice = 150000000;

        $sale = Sale::query()->updateOrCreate(
            ['vehicle_id' => $vehicle->id],
            [
                'customer_id' => $customer->id,
                'employee_id' => $employee->id,
                'area_id' => $area->id,
                'sale_date' => '2026-08-05',
                'payment_type' => PaymentType::Cash->value,
                'selling_price' => $sellingPrice,
                'credit_total' => 0,
                ...$snapshots,
                'profit_snapshot' => $this->profitCalculator->cashProfit($sellingPrice, $snapshots['final_capital_snapshot']),
            ],
        );

        SalePayment::query()->updateOrCreate(
            ['sale_id' => $sale->id],
            [
                'financing_provider_id' => null,
                'dp' => 0,
                'outstanding_dp' => 0,
                'financing_disbursement' => 0,
                'refund' => 0,
            ],
        );
    }

    private function seedSoldCreditVehicle(
        VehicleBrand $brand,
        Area $area,
        Employee $employee,
        FinancingProvider $provider,
        Collaborator $collaborator,
    ): void {
        $vehicle = Vehicle::query()->updateOrCreate(
            ['plate_number' => 'DD 1805 UAT'],
            [
                'purchase_date' => '2026-07-25',
                'brand_id' => $brand->id,
                'type' => 'HR-V E',
                'year' => 2019,
                'color' => 'Silver',
                'capital_type' => VehicleCapitalType::Umum->value,
                'showroom_capital' => 90000000,
                'collaborator_id' => $collaborator->id,
                'collaborator_capital' => 40000000,
                'tax_status' => VehicleTaxStatus::On->value,
                'tax_amount' => 1000000,
                'asking_price' => 152000000,
                'status' => VehicleStatus::Sold->value,
            ],
        );

        $this->syncCost($vehicle, VehicleCostCategory::Other, 3000000, 'UAT detailing kendaraan kredit terjual', '2026-07-27');
        $this->syncPhoto($vehicle, 'uat/vehicles/DD-1805-UAT/cover.png');

        $customer = $this->syncCustomer(
            'Customer Kredit UAT',
            '628111801805',
            'Jl. UAT Kredit No. 18',
            'uat/customers/credit-uat/ktp.txt',
        );

        $snapshots = $this->snapshots($vehicle);
        $creditTotal = $this->profitCalculator->creditTotal(
            dp: 20000000,
            outstandingDp: 5000000,
            financingDisbursement: 115000000,
            refund: 2000000,
        );

        $sale = Sale::query()->updateOrCreate(
            ['vehicle_id' => $vehicle->id],
            [
                'customer_id' => $customer->id,
                'employee_id' => $employee->id,
                'area_id' => $area->id,
                'sale_date' => '2026-08-06',
                'payment_type' => PaymentType::Credit->value,
                'selling_price' => $creditTotal,
                'credit_total' => $creditTotal,
                ...$snapshots,
                'profit_snapshot' => $this->profitCalculator->creditProfit($creditTotal, $snapshots['final_capital_snapshot']),
            ],
        );

        SalePayment::query()->updateOrCreate(
            ['sale_id' => $sale->id],
            [
                'financing_provider_id' => $provider->id,
                'dp' => 20000000,
                'outstanding_dp' => 5000000,
                'financing_disbursement' => 115000000,
                'refund' => 2000000,
            ],
        );
    }

    private function seedOperationalExpense(ExpenseCategory $category): void
    {
        $path = 'uat/operational-expenses/office-supplies-proof.txt';
        Storage::disk('local')->put($path, 'UAT placeholder proof - not a real receipt.');

        OperationalExpense::query()->updateOrCreate(
            [
                'transaction_date' => '2026-08-04',
                'description' => 'UAT perlengkapan kantor',
            ],
            [
                'category_id' => $category->id,
                'amount' => 750000,
                'proof_file_path' => $path,
                'proof_original_name' => 'uat-proof.txt',
                'proof_mime_type' => 'text/plain',
            ],
        );
    }

    private function syncCost(
        Vehicle $vehicle,
        VehicleCostCategory $category,
        int $amount,
        string $description,
        string $date,
    ): void {
        VehicleCost::query()->updateOrCreate(
            [
                'vehicle_id' => $vehicle->id,
                'category' => $category->value,
                'description' => $description,
            ],
            [
                'cost_date' => $date,
                'amount' => $amount,
            ],
        );
    }

    private function syncDocument(Vehicle $vehicle, VehicleDocumentType $type, string $path): void
    {
        Storage::disk('local')->put($path, "UAT placeholder {$type->value} - not a real document.");

        VehicleDocument::query()->updateOrCreate(
            [
                'vehicle_id' => $vehicle->id,
                'document_type' => $type->value,
            ],
            [
                'is_available' => true,
                'file_path' => $path,
                'original_name' => strtolower($type->value).'-uat.txt',
                'mime_type' => 'text/plain',
                'note' => 'Dokumen placeholder untuk UAT lokal.',
            ],
        );
    }

    private function syncPhoto(Vehicle $vehicle, string $path): void
    {
        Storage::disk('local')->put(
            $path,
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=') ?: '',
        );

        VehiclePhoto::query()->updateOrCreate(
            [
                'vehicle_id' => $vehicle->id,
                'file_path' => $path,
            ],
            [
                'original_name' => 'cover-uat.png',
                'mime_type' => 'image/png',
                'size' => Storage::disk('local')->size($path),
                'is_cover' => true,
                'sort_order' => 1,
            ],
        );
    }

    private function syncCustomer(string $name, string $whatsapp, string $address, string $ktpPath): Customer
    {
        Storage::disk('local')->put($ktpPath, 'UAT placeholder KTP - not a real identity document.');

        return Customer::query()->updateOrCreate(
            ['whatsapp' => $whatsapp],
            [
                'name' => $name,
                'alternative_whatsapp' => null,
                'address' => $address,
                'ktp_file_path' => $ktpPath,
                'ktp_original_name' => 'ktp-uat.txt',
                'ktp_mime_type' => 'text/plain',
            ],
        );
    }

    /**
     * @return array{initial_capital_snapshot: int, vehicle_cost_snapshot: int, final_capital_snapshot: int}
     */
    private function snapshots(Vehicle $vehicle): array
    {
        $vehicle->load('costs');

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
