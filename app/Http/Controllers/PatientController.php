<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class PatientController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Patients/Index');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name'                     => ['required', 'string', 'max:100'],
            'middle_name'                    => ['nullable', 'string', 'max:100'],
            'last_name'                      => ['required', 'string', 'max:100'],
            'birthdate'                      => ['required', 'date', 'before:today'],
            'gender'                         => ['required', 'in:Male,Female,Prefer not to say'],
            'civil_status'                   => ['nullable', 'in:Single,Married,Widowed,Separated'],
            'mobile_number'                  => ['required', 'string', 'max:20'],
            'email'                          => ['nullable', 'email', 'max:150'],
            'address'                        => ['nullable', 'string', 'max:500'],
            'emergency_contact_name'         => ['required', 'string', 'max:150'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:50'],
            'emergency_contact_number'       => ['required', 'string', 'max:20'],
            'allergies'                      => ['nullable', 'string', 'max:1000'],
            'medical_conditions'             => ['nullable', 'string', 'max:1000'],
            'current_medications'            => ['nullable', 'string', 'max:1000'],
            'dentist_notes'                  => ['nullable', 'string', 'max:2000'],
        ]);

        // TODO Phase 5: persist to DB
        // Patient::create($validated);

        return redirect()->route('patients.index')
            ->with('success', 'Patient added successfully.');
    }
}