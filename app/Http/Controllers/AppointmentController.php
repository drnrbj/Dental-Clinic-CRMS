<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class AppointmentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Appointments/Index');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'patient_search' => ['required', 'string', 'max:200'],
            'dentist'        => ['required', 'string', 'max:100'],
            'date'           => ['required', 'date', 'after_or_equal:today'],
            'time'           => ['required', 'string', 'max:20'],
            'type'           => ['required', 'in:Cleaning,Check-up,Extraction,Filling,Root Canal,Orthodontic,Whitening,Consultation'],
            'notes'          => ['nullable', 'string', 'max:1000'],
        ]);

        // TODO Phase 6: persist to DB and check slot availability
        // Appointment::create($validated);

        return redirect()->route('appointments.index')
            ->with('success', 'Appointment scheduled successfully.');
    }
}