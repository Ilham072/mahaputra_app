<?php

namespace App\Http\Controllers;

use App\Enums\VehicleDocumentType;
use App\Http\Requests\VehicleDocumentRequest;
use App\Models\Vehicle;
use App\Models\VehicleDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VehicleDocumentController extends Controller
{
    public function update(
        VehicleDocumentRequest $request,
        Vehicle $vehicle,
        VehicleDocumentType $documentType,
    ): RedirectResponse {
        $data = $request->validated();
        $document = VehicleDocument::query()->firstOrNew([
            'vehicle_id' => $vehicle->id,
            'document_type' => $documentType->value,
        ]);

        if ($request->hasFile('document')) {
            if ($document->file_path) {
                Storage::disk('local')->delete($document->file_path);
            }

            $file = $request->file('document');
            $path = $file->store("vehicles/{$vehicle->id}/documents", 'local');

            $document->file_path = $path;
            $document->original_name = $file->getClientOriginalName();
            $document->mime_type = $file->getMimeType();
        }

        $document->is_available = $data['is_available'];
        $document->note = $data['note'] ?? null;
        $document->save();

        return Redirect::route('vehicles.show', $vehicle)
            ->with('success', $documentType->label().' berhasil diperbarui.');
    }

    public function download(Vehicle $vehicle, VehicleDocument $document): StreamedResponse
    {
        abort_unless($document->vehicle_id === $vehicle->id, 404);
        abort_unless($document->file_path && Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->download(
            $document->file_path,
            $document->original_name ?? basename($document->file_path),
        );
    }
}
