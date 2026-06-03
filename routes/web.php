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

// ── Protected base ─────────────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::redirect('/', '/dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Patients: read (all roles) ─────────────────────────────────────────────
    Route::get('/patients',          [PatientController::class, 'index'])->name('patients.index');
    Route::get('/patients/{patient}', [PatientController::class, 'show'])->name('patients.show');

    // ── Patients: write (admin + receptionist) ────────────────────────────────
    Route::middleware('role:admin,receptionist')->group(function () {
        Route::get('/patients/create',          [PatientController::class, 'create'])->name('patients.create');
        Route::post('/patients',                [PatientController::class, 'store'])->name('patients.store');
        Route::get('/patients/{patient}/edit',  [PatientController::class, 'edit'])->name('patients.edit');
        Route::put('/patients/{patient}',       [PatientController::class, 'update'])->name('patients.update');
        Route::patch('/patients/{patient}/toggle-status', [PatientController::class, 'toggleStatus'])
             ->name('patients.toggle-status');
    });

    // ── Patients: delete (admin only) ─────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::delete('/patients/{patient}', [PatientController::class, 'destroy'])->name('patients.destroy');
    });

    // ── Appointments: available-slots BEFORE resource (avoid param collision) ──
    Route::get('/appointments/available-slots', [AppointmentController::class, 'availableSlots'])
         ->name('appointments.slots');

    // ── Appointments: read (all roles) ────────────────────────────────────────
    Route::get('/appointments',              [AppointmentController::class, 'index'])->name('appointments.index');
    Route::get('/appointments/{appointment}',[AppointmentController::class, 'show'])->name('appointments.show');

    // ── Appointments: write (admin + receptionist) ────────────────────────────
    Route::middleware('role:admin,receptionist')->group(function () {
        Route::post('/appointments',                [AppointmentController::class, 'store'])->name('appointments.store');
        Route::get('/appointments/{appointment}/edit', [AppointmentController::class, 'edit'])->name('appointments.edit');
        Route::put('/appointments/{appointment}',  [AppointmentController::class, 'update'])->name('appointments.update');
        Route::delete('/appointments/{appointment}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');
    });

    // ── Appointments: status (admin + receptionist + dentist) ────────────────
    Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])
         ->name('appointments.status');

    // ── Treatments: read (all roles) ──────────────────────────────────────────
    Route::get('/treatments',          [TreatmentController::class, 'index'])->name('treatments.index');
    Route::get('/treatments/{treatment}', [TreatmentController::class, 'show'])->name('treatments.show');

    // ── Treatments: create (dentist + admin) ──────────────────────────────────
    Route::middleware('role:dentist,admin')->group(function () {
        Route::post('/treatments', [TreatmentController::class, 'store'])->name('treatments.store');
        Route::get('/my-treatments', [MyTreatmentsController::class, 'index'])->name('my-treatments');
    });

    // ── Treatments: edit (admin only) ─────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::put('/treatments/{treatment}',   [TreatmentController::class, 'update'])->name('treatments.update');
        Route::patch('/treatments/{treatment}', [TreatmentController::class, 'update']);
    });

    // ── Billing: read (all roles) ─────────────────────────────────────────────
    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
    Route::get('/billing/invoices/{invoice}/receipt', [BillingController::class, 'receipt'])
         ->name('billing.receipt');
    
    // ── Billing: download receipt (all authenticated users) ───────────────────
    Route::get('/billing/invoices/{invoice}/download', [BillingController::class, 'downloadReceipt'])
         ->name('billing.receipt.download');

    // ── Billing: write (admin + receptionist) ────────────────────────────────
    Route::middleware('role:admin,receptionist')->group(function () {
        Route::post('/billing/invoices', [BillingController::class, 'storeInvoice'])
             ->name('billing.invoice.store');
        Route::post('/billing/invoices/{invoice}/payments', [BillingController::class, 'storePayment'])
             ->name('billing.payment.store');
    });
});