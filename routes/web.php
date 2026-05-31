<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MyTreatmentsController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\TreatmentController;
use Illuminate\Support\Facades\Route;

// ── Guest ──────────────────────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login',  [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// ── Protected ─────────────────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::redirect('/', '/dashboard');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Patients
    Route::resource('patients', PatientController::class);
    Route::patch('/patients/{patient}/toggle-status', [PatientController::class, 'toggleStatus'])
         ->name('patients.toggle-status');

    // Appointments — available-slots MUST come before resource to avoid param collision
    Route::get('/appointments/available-slots', [AppointmentController::class, 'availableSlots'])
         ->name('appointments.slots');
    Route::resource('appointments', AppointmentController::class)->except(['show']);
    Route::get('/appointments/{appointment}', [AppointmentController::class, 'show'])
         ->name('appointments.show');
    Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])
         ->name('appointments.status');

    // Treatments
    Route::resource('treatments', TreatmentController::class)->only(['index', 'store', 'show', 'update']);
    Route::get('/my-treatments', [MyTreatmentsController::class, 'index'])->name('my-treatments');

    // Billing
    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
    Route::post('/billing/invoices', [BillingController::class, 'storeInvoice'])
         ->name('billing.invoice.store');
    Route::post('/billing/invoices/{invoice}/payments', [BillingController::class, 'storePayment'])
         ->name('billing.payment.store');
    Route::get('/billing/invoices/{invoice}/receipt', [BillingController::class, 'receipt'])
         ->name('billing.receipt');
});