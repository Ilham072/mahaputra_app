<?php

namespace App\Services;

use App\Models\Area;
use App\Models\Employee;
use App\Models\ExpenseCategory;
use App\Models\FinancingProvider;
use App\Models\VehicleBrand;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class MasterDataService
{
    /**
     * @return array<string, array{model: class-string<Model>, label: string, title: string, description: string}>
     */
    public function definitions(): array
    {
        return [
            'employees' => [
                'model' => Employee::class,
                'label' => 'Karyawan',
                'title' => 'Karyawan',
                'description' => 'Kelola karyawan yang digunakan sebagai PIC transaksi.',
            ],
            'areas' => [
                'model' => Area::class,
                'label' => 'Area',
                'title' => 'Area',
                'description' => 'Kelola pilihan area transaksi.',
            ],
            'vehicle-brands' => [
                'model' => VehicleBrand::class,
                'label' => 'Merk Kendaraan',
                'title' => 'Merk Kendaraan',
                'description' => 'Kelola merk kendaraan untuk dropdown kendaraan.',
            ],
            'financing-providers' => [
                'model' => FinancingProvider::class,
                'label' => 'Pembiayaan',
                'title' => 'Perusahaan Pembiayaan',
                'description' => 'Kelola perusahaan pembiayaan untuk transaksi kredit.',
            ],
            'expense-categories' => [
                'model' => ExpenseCategory::class,
                'label' => 'Kategori Operasional',
                'title' => 'Kategori Operasional',
                'description' => 'Kelola kategori biaya operasional perusahaan.',
            ],
        ];
    }

    /**
     * @return array{model: class-string<Model>, label: string, title: string, description: string}
     */
    public function definition(string $resource): array
    {
        abort_unless(isset($this->definitions()[$resource]), 404);

        return $this->definitions()[$resource];
    }

    /**
     * @return Collection<int, array{id: int, name: string, is_active: bool}>
     */
    public function items(string $resource): Collection
    {
        $model = $this->definition($resource)['model'];

        return $model::query()
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get(['id', 'name', 'is_active'])
            ->map(fn (Model $item): array => [
                'id' => $item->getKey(),
                'name' => $item->getAttribute('name'),
                'is_active' => $item->getAttribute('is_active'),
            ]);
    }

    public function create(string $resource, array $data): Model
    {
        $model = $this->definition($resource)['model'];

        return $model::query()->create([
            'name' => $data['name'],
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function update(string $resource, int $id, array $data): Model
    {
        $item = $this->find($resource, $id);

        $item->update([
            'name' => $data['name'],
            'is_active' => $data['is_active'],
        ]);

        return $item;
    }

    public function deactivate(string $resource, int $id): Model
    {
        $item = $this->find($resource, $id);
        $item->update(['is_active' => false]);

        return $item;
    }

    public function find(string $resource, int $id): Model
    {
        $model = $this->definition($resource)['model'];

        return $model::query()->findOrFail($id);
    }
}
