<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Patient::query()->withTrashed(false); // exclude soft-deleted

        // Status filter
        $status = $request->input('status', 'active');
        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'archived') {
            $query->where('is_active', false);
        }
        // 'all' → no additional filter

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name',    'like', "%{$search}%")
                  ->orWhere('last_name',   'like', "%{$search}%")
                  ->orWhere('patient_code','like', "%{$search}%")
                  ->orWhere('mobile_number','like',"%{$search}%");
            });
        }

        $patients = $query
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Patient $p) => [
                'id'             => $p->id,
                'patient_code'   => $p->patient_code,
                'full_name'      => $p->full_name,
                'age'            => $p->age,
                'gender'         => ucfirst(str_replace('_', ' ', $p->gender)),
                'display_mobile' => $p->display_mobile,
                'email'          => $p->email,
                'last_visit'     => optional(
                    $p->appointments()->latest('appointment_date')->first()
                )->appointment_date?->format('M d, Y'),
                'is_active'      => $p->is_active,
            ]);

        return Inertia::render('Patients/Index', [
            'patients' => $patients,
            'filters'  => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        $patient = Patient::create(array_merge(
            $validated,
            ['created_by' => auth()->id()]
        ));

        return redirect()->route('patients.index')
            ->with('success', "Patient {$patient->full_name} added successfully.");
    }

    public function show(Patient $patient): Response
    {
        $patient->load([
            'appointments' => fn ($q) => $q->with('dentist')->latest('appointment_date'),
            'treatments'   => fn ($q) => $q->with('dentist')->latest('treatment_date'),
            'invoices'     => fn ($q) => $q->latest('invoice_date'),
        ]);

        return Inertia::render('Patients/Show', [
            'patient' => [
                'id'                             => $patient->id,
                'patient_code'                   => $patient->patient_code,
                'full_name'                      => $patient->full_name,
                'first_name'                     => $patient->first_name,
                'middle_name'                    => $patient->middle_name,
                'last_name'                      => $patient->last_name,
                'birthdate'                      => $patient->birthdate->format('Y-m-d'),
                'birthdate_display'              => $patient->birthdate->format('F d, Y'),
                'age'                            => $patient->age,
                'gender'                         => $patient->gender,
                'gender_display'                 => ucfirst(str_replace('_', ' ', $patient->gender)),
                'civil_status'                   => $patient->civil_status,
                'civil_status_display'           => $patient->civil_status ? ucfirst($patient->civil_status) : '—',
                'mobile_number'                  => $patient->mobile_number,
                'display_mobile'                 => $patient->display_mobile,
                'email'                          => $patient->email,
                'address'                        => $patient->address,
                'emergency_contact_name'         => $patient->emergency_contact_name,
                'emergency_contact_relationship' => $patient->emergency_contact_relationship,
                'emergency_contact_number'       => $patient->emergency_contact_number,
                'allergies'                      => $patient->allergies,
                'medical_conditions'             => $patient->medical_conditions,
                'current_medications'            => $patient->current_medications,
                'dentist_notes'                  => $patient->dentist_notes,
                'is_active'                      => $patient->is_active,
                'created_at'                     => $patient->created_at->format('M d, Y'),
                'appointments'                   => $patient->appointments->map(fn ($a) => [
                    'id'               => $a->id,
                    'appointment_date' => optional($a->appointment_date)?->format('M d, Y'),
                    'appointment_time' => $a->appointment_time ?? null,
                    'dentist_name'     => optional($a->dentist)->name,
                    'type'             => $a->type,
                    'status'           => $a->status,
                    'notes'            => $a->notes,
                ]),
                'treatments'                     => $patient->treatments->map(fn ($t) => [
                    'id'             => $t->id,
                    'treatment_date' => optional($t->treatment_date)?->format('M d, Y'),
                    'dentist_name'   => optional($t->dentist)->name,
                    'procedure'      => $t->procedure,
                    'diagnosis'      => $t->diagnosis,
                    'cost'           => $t->cost,
                    'notes'          => $t->notes,
                ]),
                'invoices'                       => $patient->invoices->map(fn ($i) => [
                    'id'             => $i->id,
                    'invoice_number' => $i->invoice_number,
                    'invoice_date'   => optional($i->invoice_date)?->format('M d, Y'),
                    'total_amount'   => $i->total_amount,
                    'amount_paid'    => $i->amount_paid,
                    'balance'        => $i->total_amount - $i->amount_paid,
                    'status'         => $i->status,
                ]),
            ],
        ]);
    }

    public function edit(Patient $patient): Response
    {
        return Inertia::render('Patients/Edit', [
            'patient' => [
                'id'                             => $patient->id,
                'patient_code'                   => $patient->patient_code,
                'first_name'                     => $patient->first_name,
                'middle_name'                    => $patient->middle_name,
                'last_name'                      => $patient->last_name,
                'birthdate'                      => $patient->birthdate->format('Y-m-d'),
                'gender'                         => $patient->gender,
                'civil_status'                   => $patient->civil_status,
                'mobile_number'                  => $patient->mobile_number,
                'email'                          => $patient->email,
                'address'                        => $patient->address,
                'emergency_contact_name'         => $patient->emergency_contact_name,
                'emergency_contact_relationship' => $patient->emergency_contact_relationship,
                'emergency_contact_number'       => $patient->emergency_contact_number,
                'allergies'                      => $patient->allergies,
                'medical_conditions'             => $patient->medical_conditions,
                'current_medications'            => $patient->current_medications,
                'dentist_notes'                  => $patient->dentist_notes,
                'is_active'                      => $patient->is_active,
            ],
        ]);
    }

    public function update(Request $request, Patient $patient): RedirectResponse
    {
        $validated = $request->validate($this->rules($patient->id));

        $patient->update($validated);

        return redirect()->route('patients.show', $patient)
            ->with('success', "Patient {$patient->full_name} updated successfully.");
    }

    public function destroy(Patient $patient): RedirectResponse
    {
        if (! auth()->user()->isAdmin()) {
            abort(403, 'Only admins can delete patients.');
        }

        $patient->delete();

        return redirect()->route('patients.index')
            ->with('success', "Patient {$patient->full_name} has been removed.");
    }

    public function toggleStatus(Patient $patient): RedirectResponse
    {
        $patient->update(['is_active' => ! $patient->is_active]);

        $message = $patient->is_active
            ? "Patient {$patient->full_name} restored."
            : "Patient {$patient->full_name} archived.";

        return redirect()->back()->with('success', $message);
    }

    // ─── Shared validation rules ──────────────────────────────────────────────

    private function rules(?int $ignoreId = null): array
    {
        return [
            'first_name'                     => ['required', 'string', 'max:100'],
            'middle_name'                    => ['nullable', 'string', 'max:100'],
            'last_name'                      => ['required', 'string', 'max:100'],
            'birthdate'                      => ['required', 'date', 'before:today'],
            'gender'                         => ['required', 'in:male,female,prefer_not_to_say'],
            'civil_status'                   => ['nullable', 'in:single,married,widowed,separated'],
            'mobile_number'                  => ['required', 'regex:/^09\d{9}$/'],
            'email'                          => [
                'nullable',
                'email',
                'max:150',
                Rule::unique('patients', 'email')->ignore($ignoreId),
            ],
            'address'                        => ['nullable', 'string', 'max:500'],
            'emergency_contact_name'         => ['required', 'string', 'max:150'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:50'],
            'emergency_contact_number'       => ['required', 'string', 'max:20'],
            'allergies'                      => ['nullable', 'string', 'max:1000'],
            'medical_conditions'             => ['nullable', 'string', 'max:1000'],
            'current_medications'            => ['nullable', 'string', 'max:1000'],
            'dentist_notes'                  => ['nullable', 'string', 'max:2000'],
        ];
    }
}