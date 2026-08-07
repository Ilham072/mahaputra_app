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

    public function index(Request $request, string $resource): Response
    {
        $definition = $this->masterData->definition($resource);

        return Inertia::render('MasterData/Index', [
            'resource' => $resource,
            'title' => $definition['title'],
            'description' => $definition['description'],
            'resources' => collect($this->masterData->definitions())
                ->map(fn (array $definition, string $key): array => [
                    'key' => $key,
                    'label' => $definition['label'],
                    'href' => route('master.index', $key),
                ])
                ->values(),
            'items' => $this->masterData->items($resource),
        ]);
    }

    public function store(MasterDataRequest $request, string $resource): RedirectResponse
    {
        $this->masterData->create($resource, $request->validated());

        return Redirect::route('master.index', $resource)
            ->with('success', 'Master data berhasil ditambahkan.');
    }

    public function update(MasterDataRequest $request, string $resource, int $id): RedirectResponse
    {
        $this->masterData->update($resource, $id, $request->validated());

        return Redirect::route('master.index', $resource)
            ->with('success', 'Master data berhasil diperbarui.');
    }

    public function destroy(string $resource, int $id): RedirectResponse
    {
        $this->masterData->deactivate($resource, $id);

        return Redirect::route('master.index', $resource)
            ->with('success', 'Master data berhasil dinonaktifkan.');
    }
}
