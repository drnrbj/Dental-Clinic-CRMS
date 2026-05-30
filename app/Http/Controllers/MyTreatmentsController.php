<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Treatment;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class MyTreatmentsController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        $user = auth()->user();

        // Restrict to dentists and admins
        if (! ($user->isDentist() || $user->isAdmin())) {
            abort(403, 'Access restricted to dentists and admins.');
        }

        // ── Ready to treat: today's confirmed/ongoing appointments for this dentist ─
        $readyToTreat = Appointment::with('patient')
            ->where('dentist_id', $user->id)
            ->whereDate('appointment_date', today())
            ->whereIn('status', ['confirmed', 'ongoing'])
            ->orderBy('appointment_time')
            ->get()
            ->map(fn (Appointment $a) => [
                'id'           => $a->id,
                'patient_id'   => $a->patient_id,
                'patient_name' => optional($a->patient)->full_name,
                'time'         => Carbon::createFromTimeString($a->appointment_time)->format('g:i A'),
                'time_slot'    => $a->time_slot,
                'type'         => $a->type,
                'type_display' => ucwords(str_replace('_', ' ', $a->type)),
                'status'       => $a->status,
                'remarks'      => $a->remarks,
                // Flag if a treatment has already been recorded for this appointment
                'has_treatment' => Treatment::where('appointment_id', $a->id)->exists(),
            ]);

        // ── Treatment history: all treatments by this dentist, newest first ─────
        $treatmentHistory = Treatment::with('patient')
            ->where('dentist_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Treatment $t) => [
                'id'                => $t->id,
                'appointment_id'    => $t->appointment_id,
                'patient_id'        => $t->patient_id,
                'patient_name'      => optional($t->patient)->full_name,
                'procedure'         => $t->procedure,
                'procedure_display' => ucwords(str_replace('_', ' ', $t->procedure)),
                'diagnosis'         => $t->diagnosis,
                'diagnosis_truncated' => mb_strlen($t->diagnosis) > 100
                    ? mb_substr($t->diagnosis, 0, 100) . '…'
                    : $t->diagnosis,
                'treatment_cost'    => $t->treatment_cost,
                'cost_display'      => '₱' . number_format((float) $t->treatment_cost, 2),
                'date'              => $t->created_at->format('M d, Y'),
            ]);

        return Inertia::render('Treatments/MyTreatments', [
            'readyToTreat'     => $readyToTreat,
            'treatmentHistory' => $treatmentHistory,
        ]);
    }
}