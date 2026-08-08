<?php

namespace App\Http\Controllers;

use App\Http\Requests\VehiclePhotoRequest;
use App\Models\Vehicle;
use App\Models\VehiclePhoto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class VehiclePhotoController extends Controller
{
    public function store(VehiclePhotoRequest $request, Vehicle $vehicle): RedirectResponse
    {
        $storedPaths = [];

        try {
            DB::transaction(function () use ($request, $vehicle, &$storedPaths): void {
                $nextOrder = (int) $vehicle->photos()->max('sort_order') + 1;
                $hasCover = $vehicle->photos()->where('is_cover', true)->exists();

                /** @var array<int, UploadedFile> $photos */
                $photos = $request->file('photos', []);

                foreach ($photos as $index => $photo) {
                    $path = $photo->store("vehicles/{$vehicle->id}/photos", 'local');
                    $storedPaths[] = $path;

                    $vehicle->photos()->create([
                        'file_path' => $path,
                        'original_name' => $photo->getClientOriginalName(),
                        'mime_type' => $photo->getMimeType(),
                        'size' => $photo->getSize() ?: 0,
                        'is_cover' => ! $hasCover && $index === 0,
                        'sort_order' => $nextOrder + $index,
                    ]);
                }
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($storedPaths);

            throw $exception;
        }

        return Redirect::route('vehicles.show', $vehicle)
            ->with('success', 'Foto kendaraan berhasil ditambahkan.');
    }

    public function show(Vehicle $vehicle, VehiclePhoto $photo): StreamedResponse
    {
        abort_unless($photo->vehicle_id === $vehicle->id, 404);
        abort_unless(Storage::disk('local')->exists($photo->file_path), 404);

        return Storage::disk('local')->response(
            $photo->file_path,
            $photo->original_name ?? basename($photo->file_path),
            ['Content-Disposition' => 'inline'],
        );
    }

    public function cover(Vehicle $vehicle, VehiclePhoto $photo): RedirectResponse
    {
        abort_unless($photo->vehicle_id === $vehicle->id, 404);

        DB::transaction(function () use ($vehicle, $photo): void {
            $vehicle->photos()->update(['is_cover' => false]);
            $photo->update(['is_cover' => true]);
        });

        return Redirect::route('vehicles.show', $vehicle)
            ->with('success', 'Cover kendaraan berhasil diperbarui.');
    }

    public function destroy(Vehicle $vehicle, VehiclePhoto $photo): RedirectResponse
    {
        abort_unless($photo->vehicle_id === $vehicle->id, 404);

        $path = $photo->file_path;
        $wasCover = $photo->is_cover;

        DB::transaction(function () use ($vehicle, $photo, $wasCover): void {
            $photo->delete();

            if ($wasCover) {
                $vehicle->photos()
                    ->orderBy('sort_order')
                    ->orderBy('id')
                    ->first()
                    ?->update(['is_cover' => true]);
            }
        });

        Storage::disk('local')->delete($path);

        return Redirect::route('vehicles.show', $vehicle)
            ->with('success', 'Foto kendaraan berhasil dihapus.');
    }
}
