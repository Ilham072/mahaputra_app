<?php

namespace App\Http\Controllers;

use App\Actions\AddVehicleCostAction;
use App\Http\Requests\VehicleCostRequest;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;

class VehicleCostController extends Controller
{
    public function store(
        VehicleCostRequest $request,
        Vehicle $vehicle,
        AddVehicleCostAction $action,
    ): RedirectResponse {
        $action->execute($vehicle, $request->validated());

        return Redirect::route('vehicles.show', $vehicle)
            ->with('success', 'Biaya kendaraan berhasil ditambahkan.');
    }
}
