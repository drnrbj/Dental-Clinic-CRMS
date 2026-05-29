<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\TreatmentController;
use App\Http\Controllers\BillingController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Patients — resource + toggleStatus
    Route::resource('patients', PatientController::class);
    Route::patch('/patients/{patient}/toggle-status', [PatientController::class, 'toggleStatus'])
         ->name('patients.toggle-status');

    // Appointments — resource
    Route::resource('appointments', AppointmentController::class);

    // Treatments — resource (wired later)
    Route::resource('treatments', TreatmentController::class)->only(['index', 'show', 'store']);

    // Billing — resource (wired later)
    Route::resource('billing', BillingController::class)->only(['index', 'show']);

    // Logout
    Route::post('/logout', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'destroy'])
         ->name('logout');
});

if (file_exists(__DIR__.'/auth.php')) {
    require __DIR__.'/auth.php';
}