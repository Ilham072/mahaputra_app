<?php

namespace App\Http\Controllers;

use App\Http\Requests\MasterDataRequest;
use App\Services\MasterDataService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class MasterDataController extends Controller
{
    public function __construct(private readonly MasterDataService $masterData) {}

    public function index(Request $request): Response
    {
        $resource = $request->string('type')->toString() ?: 'employees';
        $definition = $this->masterData->definition($resource);
        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();

        return Inertia::render('MasterData/Index', [
            'resource' => $resource,
            'pageTitle' => 'Master Data',
            'pageDescription' => 'Kelola data referensi yang digunakan dalam operasional MahaputraMotor.',
            'title' => $definition['title'],
            'label' => $definition['label'],
            'description' => $definition['description'],
            'fieldLabel' => $definition['field_label'],
            'addLabel' => $definition['add_label'],
            'resources' => collect($this->masterData->definitions())
                ->map(fn (array $definition, string $key): array => [
                    'key' => $key,
                    'label' => $definition['label'],
                    'href' => route('master-data.index', ['type' => $key]),
                ])
                ->values(),
            'items' => $this->masterData->items($resource, $search, $status),
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function legacyIndex(string $resource): RedirectResponse
    {
        $this->masterData->definition($resource);

        return Redirect::route('master-data.index', ['type' => $resource]);
    }

    public function store(MasterDataRequest $request, string $resource): RedirectResponse
    {
        $this->masterData->create($resource, $request->validated());

        return Redirect::route('master-data.index', ['type' => $resource])
            ->with('success', 'Master data berhasil ditambahkan.');
    }

    public function update(MasterDataRequest $request, string $resource, int $id): RedirectResponse
    {
        $this->masterData->update($resource, $id, $request->validated());

        return Redirect::route('master-data.index', ['type' => $resource])
            ->with('success', 'Master data berhasil diperbarui.');
    }

    public function destroy(string $resource, int $id): RedirectResponse
    {
        $this->masterData->deactivate($resource, $id);

        return Redirect::route('master-data.index', ['type' => $resource])
            ->with('success', 'Master data berhasil dinonaktifkan.');
    }
}
