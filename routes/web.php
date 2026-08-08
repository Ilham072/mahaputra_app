<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\OperationalExpenseController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\VehicleCostController;
use App\Http\Controllers\VehicleDocumentController;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;

Route::get('/', function (): RedirectResponse {
    return redirect()->route(auth()->check() ? 'dashboard' : 'login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'role:admin,owner'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'role:admin'])->group(function (): void {
    Route::post('/operations', [OperationalExpenseController::class, 'store'])->name('operations.store');
    Route::get('/vehicles/create', [VehicleController::class, 'create'])->name('vehicles.create');
    Route::post('/vehicles', [VehicleController::class, 'store'])->name('vehicles.store');
    Route::post('/vehicles/{vehicle}/costs', [VehicleCostController::class, 'store'])->name('vehicles.costs.store');
    Route::post('/vehicles/{vehicle}/documents/{documentType}', [VehicleDocumentController::class, 'update'])
        ->whereIn('documentType', ['STNK', 'BPKB'])
        ->name('vehicles.documents.update');
    Route::get('/vehicles/{vehicle}/sell', [SaleController::class, 'create'])->name('vehicles.sales.create');
    Route::post('/vehicles/{vehicle}/sell', [SaleController::class, 'store'])->name('vehicles.sales.store');
    Route::get('/vehicles/{vehicle}/edit', [VehicleController::class, 'edit'])->name('vehicles.edit');
    Route::patch('/vehicles/{vehicle}', [VehicleController::class, 'update'])->name('vehicles.update');
});

Route::middleware(['auth', 'role:admin,owner'])->group(function (): void {
    Route::get('/operations', [OperationalExpenseController::class, 'index'])->name('operations.index');
    Route::get('/operations/{expense}/proof', [OperationalExpenseController::class, 'downloadProof'])->name('operations.proof.download');
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/sales', [SaleController::class, 'index'])->name('sales.index');
    Route::get('/sales/{sale}', [SaleController::class, 'show'])->name('sales.show');
    Route::get('/sales/{sale}/ktp', [SaleController::class, 'downloadKtp'])->name('sales.ktp.download');
    Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
    Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show'])->name('vehicles.show');
    Route::get('/vehicles/{vehicle}/documents/{document}/download', [VehicleDocumentController::class, 'download'])
        ->name('vehicles.documents.download');
});

Route::middleware(['auth', 'role:admin'])
    ->prefix('master')
    ->name('master.')
    ->whereIn('resource', [
        'employees',
        'areas',
        'vehicle-brands',
        'financing-providers',
        'expense-categories',
    ])
    ->group(function (): void {
        Route::redirect('/', '/master/employees')->name('root');
        Route::get('/{resource}', [MasterDataController::class, 'index'])->name('index');
        Route::post('/{resource}', [MasterDataController::class, 'store'])->name('store');
        Route::patch('/{resource}/{id}', [MasterDataController::class, 'update'])->name('update');
        Route::delete('/{resource}/{id}', [MasterDataController::class, 'destroy'])->name('destroy');
    });

require __DIR__.'/auth.php';
