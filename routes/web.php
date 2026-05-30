<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\TreatmentController;
use App\Http\Controllers\BillingController;
use Illuminate\Support\Facades\Route;

// ── Guest routes ──────────────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

// ── Auth routes ───────────────────────────────────────────────────────────────
Route::post('/logout', [AuthController::class, 'logout'])
    ->name('logout')
    ->middleware('auth');

// ── Protected routes ──────────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::redirect('/', '/dashboard');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Patients
    Route::resource('patients', PatientController::class);
    Route::patch('/patients/{patient}/toggle-status', [PatientController::class, 'toggleStatus'])
         ->name('patients.toggle-status');

    // Appointments
    Route::resource('appointments', AppointmentController::class);

    // Treatments (wired in later phase)
    Route::resource('treatments', TreatmentController::class)->only(['index', 'show', 'store']);

    // Billing (wired in later phase)
    Route::resource('billing', BillingController::class)->only(['index', 'show']);
});