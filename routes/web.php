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

    // Patients
    Route::get('/patients',          [PatientController::class, 'index'])->name('patients.index');
    Route::post('/patients',         [PatientController::class, 'store'])->name('patients.store');
    Route::get('/patients/{patient}',      [PatientController::class, 'show'])->name('patients.show');
    Route::get('/patients/{patient}/edit', [PatientController::class, 'edit'])->name('patients.edit');
    Route::put('/patients/{patient}',      [PatientController::class, 'update'])->name('patients.update');

    // Appointments
    Route::get('/appointments',   [AppointmentController::class, 'index'])->name('appointments.index');
    Route::post('/appointments',  [AppointmentController::class, 'store'])->name('appointments.store');
    Route::get('/appointments/{appointment}',      [AppointmentController::class, 'show'])->name('appointments.show');
    Route::get('/appointments/{appointment}/edit', [AppointmentController::class, 'edit'])->name('appointments.edit');
    Route::put('/appointments/{appointment}',      [AppointmentController::class, 'update'])->name('appointments.update');

    // Treatments
    Route::get('/treatments', [TreatmentController::class, 'index'])->name('treatments.index');

    // Billing
    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');

    // Auth
    Route::post('/logout', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

require __DIR__.'/auth.php';