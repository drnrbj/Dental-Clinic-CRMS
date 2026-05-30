<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Treatment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TreatmentController extends Controller
{
    private const PROCEDURES = [
        'cleaning', 'extraction', 'filling', 'root_canal',
        'crown', 'whitening', 'braces_adjustment', 'consultation',
    ];

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Treatment::class);

        $query = Treatment::with(['patient', 'dentist', 'appointment'])
            ->orderByDesc('created_at');

        if ($request->filled('patient_id'))  $query->where('patient_id', $request->patient_id);
        if ($request->filled('dentist_id'))  $query->where('dentist_id', $request->dentist_id);
        if ($request->filled('date_from'))   $query->whereDate('created_at', '>=', $request->date_from);
        if ($request->filled('date_to'))     $query->whereDate('created_at', '<=', $request->date_to);

        $treatments = $query->paginate(15)->withQueryString()->through(
            fn (Treatment $t) => $this->formatTreatment($t)
        );

        return Inertia::render('Treatments/Index', [
            'treatments' => $treatments,
            'filters'    => $request->only(['patient_id', 'dentist_id', 'date_from', 'date_to']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', Treatment::class);

        $validated = $request->validate([
            'appointment_id'  => ['required', 'exists:appointments,id'],
            'diagnosis'       => ['required', 'string', 'min:10', 'max:3000'],
            'procedure'       => ['required', 'in:' . implode(',', self::PROCEDURES)],
            'prescription'    => ['nullable', 'string', 'max:3000'],
            'clinical_notes'  => ['nullable', 'string', 'max:3000'],
            'treatment_cost'  => ['required', 'numeric', 'min:0', 'max:999999.99'],
        ]);

        $appointment = Appointment::findOrFail($validated['appointment_id']);

        if ($appointment->status !== 'ongoing') {
            return back()->withErrors([
                'appointment_id' => "Appointment must be 'ongoing' before recording a treatment. Current status: {$appointment->status}.",
            ]);
        }

        if (Treatment::where('appointment_id', $appointment->id)->exists()) {
            return back()->withErrors([
                'appointment_id' => 'A treatment has already been recorded for this appointment.',
            ]);
        }

        Treatment::create(array_merge($validated, [
            'patient_id' => $appointment->patient_id,
            'dentist_id' => $appointment->dentist_id,
        ]));

        return redirect()->route('my-treatments')
            ->with('success', 'Treatment recorded successfully.');
    }

    public function show(Treatment $treatment): Response
    {
        Gate::authorize('view', $treatment);
        $treatment->load(['patient', 'dentist', 'appointment']);

        return Inertia::render('Treatments/Show', [
            'treatment' => $this->formatTreatment($treatment, detailed: true),
        ]);
    }

    public function update(Request $request, Treatment $treatment): RedirectResponse
    {
        Gate::authorize('update', $treatment);

        $validated = $request->validate([
            'diagnosis'      => ['required', 'string', 'min:10', 'max:3000'],
            'procedure'      => ['required', 'in:' . implode(',', self::PROCEDURES)],
            'prescription'   => ['nullable', 'string', 'max:3000'],
            'clinical_notes' => ['nullable', 'string', 'max:3000'],
            'treatment_cost' => ['required', 'numeric', 'min:0', 'max:999999.99'],
        ]);

        $treatment->update($validated);

        return redirect()->back()->with('success', 'Treatment updated successfully.');
    }

    private function formatTreatment(Treatment $t, bool $detailed = false): array
    {
        $base = [
            'id'                => $t->id,
            'appointment_id'    => $t->appointment_id,
            'patient_id'        => $t->patient_id,
            'patient_name'      => optional($t->patient)->full_name,
            'dentist_name'      => optional($t->dentist)->name,
            'diagnosis'         => $t->diagnosis,
            'procedure'         => $t->procedure,
            'procedure_display' => ucwords(str_replace('_', ' ', $t->procedure)),
            'treatment_cost'    => $t->treatment_cost,
            'cost_display'      => '₱' . number_format((float) $t->treatment_cost, 2),
            'date'              => $t->created_at->format('M d, Y'),
            'date_raw'          => $t->created_at->toDateString(),
        ];

        if ($detailed) {
            $base = array_merge($base, [
                'prescription'   => $t->prescription,
                'clinical_notes' => $t->clinical_notes,
                'appointment'    => $t->appointment ? [
                    'id'                 => $t->appointment->id,
                    'formatted_datetime' => $t->appointment->formatted_datetime,
                    'type'               => $t->appointment->type,
                ] : null,
            ]);
        }

        return $base;
    }
}