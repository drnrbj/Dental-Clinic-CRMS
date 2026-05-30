<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\TreatmentController;
use App\Http\Controllers\MyTreatmentsController;
use App\Http\Controllers\BillingController;
use Illuminate\Support\Facades\Route;

// ── Guest ──────────────────────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login',  [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

// ── Logout ─────────────────────────────────────────────────────────────────────
Route::post('/logout', [AuthController::class, 'logout'])
    ->name('logout')
    ->middleware('auth');

// ── Protected ─────────────────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::redirect('/', '/dashboard');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Patients
    Route::resource('patients', PatientController::class);
    Route::patch('/patients/{patient}/toggle-status', [PatientController::class, 'toggleStatus'])
         ->name('patients.toggle-status');

    // Appointments
    // NOTE: available-slots must come BEFORE the resource to avoid route collision
    Route::get('/appointments/available-slots', [AppointmentController::class, 'availableSlots'])
         ->name('appointments.slots');
    Route::resource('appointments', AppointmentController::class)->except(['show']);
    Route::get('/appointments/{appointment}',  [AppointmentController::class, 'show'])
         ->name('appointments.show');
    Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])
         ->name('appointments.status');

    // Treatments — admin/receptionist list view
    Route::resource('treatments', TreatmentController::class)
         ->only(['index', 'store', 'show', 'update']);

    // My Treatments — dentist workflow page
    Route::get('/my-treatments', [MyTreatmentsController::class, 'index'])
         ->name('my-treatments');

    // Billing (wired in later phase)
    Route::resource('billing', BillingController::class)->only(['index', 'show']);
});