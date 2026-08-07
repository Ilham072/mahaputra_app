<?php

use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\ProfileController;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function (): RedirectResponse {
    return redirect()->route(auth()->check() ? 'dashboard' : 'login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware('auth')->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
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
