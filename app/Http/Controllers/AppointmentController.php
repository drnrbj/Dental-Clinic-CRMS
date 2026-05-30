<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AppointmentStatusLog;
use App\Models\Patient;
use App\Models\User;
use App\Services\AppointmentAvailabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function __construct(
        private AppointmentAvailabilityService $availability
    ) {}

    // ─── Status transition rules ──────────────────────────────────────────────

    private const TRANSITIONS = [
        'pending'   => ['confirmed', 'cancelled'],
        'confirmed' => ['ongoing', 'no_show', 'cancelled'],
        'ongoing'   => ['completed'],
        'completed' => [],
        'cancelled' => [],
        'no_show'   => [],
    ];

    // ─── index ────────────────────────────────────────────────────────────────

    public function index(Request $request): Response|JsonResponse
    {
        // FullCalendar requests events as JSON
        if ($request->wantsJson()) {
            $query = Appointment::with(['patient', 'dentist'])
                ->whereBetween('appointment_date', [
                    $request->input('start', now()->startOfMonth()->toDateString()),
                    $request->input('end',   now()->endOfMonth()->toDateString()),
                ]);

            if ($request->filled('dentist_id')) {
                $query->where('dentist_id', $request->dentist_id);
            }
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            return response()->json(
                $query->get()->map->toCalendarEvent()->values()
            );
        }

        // Inertia page render (with sidebar list)
        $query = Appointment::with(['patient', 'dentist'])
            ->whereDate('appointment_date', today());

        $todayAppointments = $query->orderBy('appointment_time')->get()->map(fn ($a) => [
            'id'             => $a->id,
            'time'           => \Carbon\Carbon::createFromTimeString($a->appointment_time)->format('g:i A'),
            'time_slot'      => $a->time_slot,
            'patient_name'   => optional($a->patient)->full_name,
            'patient_id'     => $a->patient_id,
            'dentist_name'   => optional($a->dentist)->name,
            'type'           => ucfirst(str_replace('_', ' ', $a->type)),
            'status'         => $a->status,
            'remarks'        => $a->remarks,
        ]);

        $dentists = User::where('role', 'dentist')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($u) => ['id' => $u->id, 'name' => $u->name]);

        return Inertia::render('Appointments/Index', [
            'todayAppointments' => $todayAppointments,
            'dentists'          => $dentists,
        ]);
    }

    // ─── show (JSON only — used by detail panel) ──────────────────────────────

    public function show(Appointment $appointment): JsonResponse
    {
        $appointment->load([
            'patient',
            'dentist',
            'statusLogs.changedBy',
        ]);

        return response()->json([
            'id'               => $appointment->id,
            'formatted_datetime' => $appointment->formatted_datetime,
            'time_slot'        => $appointment->time_slot,
            'type'             => $appointment->type,
            'type_display'     => ucfirst(str_replace('_', ' ', $appointment->type)),
            'status'           => $appointment->status,
            'remarks'          => $appointment->remarks,
            'cancelled_reason' => $appointment->cancelled_reason,
            'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
            'appointment_time' => $appointment->appointment_time,
            'duration_minutes' => $appointment->duration_minutes,
            'patient'          => $appointment->patient ? [
                'id'        => $appointment->patient->id,
                'full_name' => $appointment->patient->full_name,
                'display_mobile' => $appointment->patient->display_mobile,
            ] : null,
            'dentist'          => $appointment->dentist ? [
                'id'   => $appointment->dentist->id,
                'name' => $appointment->dentist->name,
            ] : null,
            'status_logs'      => $appointment->statusLogs->map(fn ($log) => [
                'id'          => $log->id,
                'from_status' => $log->from_status,
                'to_status'   => $log->to_status,
                'reason'      => $log->reason,
                'changed_by'  => ['name' => optional($log->changedBy)->name],
                'created_at'  => $log->created_at->toIso8601String(),
            ]),
        ]);
    }

    // ─── store ────────────────────────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'patient_id'       => ['required', 'exists:patients,id'],
            'dentist_id'       => ['required', 'exists:users,id'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:240'],
            'type'             => ['required', 'in:cleaning,checkup,extraction,filling,root_canal,orthodontic,whitening,consultation'],
            'remarks'          => ['nullable', 'string', 'max:1000'],
        ]);

        $duration = $validated['duration_minutes'] ?? 60;

        if ($this->availability->hasConflict(
            $validated['dentist_id'],
            $validated['appointment_date'],
            $validated['appointment_time'],
            $duration
        )) {
            return back()->withErrors([
                'appointment_time' => 'This dentist already has an appointment in that time slot. Please choose another time.',
            ]);
        }

        $appointment = Appointment::create(array_merge($validated, [
            'duration_minutes' => $duration,
            'status'           => 'pending',
            'created_by'       => auth()->id(),
        ]));

        return redirect()->route('appointments.index')
            ->with('success', "Appointment scheduled for {$appointment->patient->full_name}.");
    }

    // ─── update ───────────────────────────────────────────────────────────────

    public function update(Request $request, Appointment $appointment): RedirectResponse
    {
        if (! $appointment->isEditable()) {
            return back()->withErrors(['status' => 'Only pending or confirmed appointments can be rescheduled.']);
        }

        $validated = $request->validate([
            'patient_id'       => ['required', 'exists:patients,id'],
            'dentist_id'       => ['required', 'exists:users,id'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:240'],
            'type'             => ['required', 'in:cleaning,checkup,extraction,filling,root_canal,orthodontic,whitening,consultation'],
            'remarks'          => ['nullable', 'string', 'max:1000'],
        ]);

        $duration = $validated['duration_minutes'] ?? $appointment->duration_minutes;

        if ($this->availability->hasConflict(
            $validated['dentist_id'],
            $validated['appointment_date'],
            $validated['appointment_time'],
            $duration,
            $appointment->id
        )) {
            return back()->withErrors([
                'appointment_time' => 'This dentist already has an appointment in that time slot.',
            ]);
        }

        $appointment->update(array_merge($validated, ['duration_minutes' => $duration]));

        return redirect()->route('appointments.index')
            ->with('success', 'Appointment updated successfully.');
    }

    // ─── updateStatus ─────────────────────────────────────────────────────────

    public function updateStatus(Request $request, Appointment $appointment): JsonResponse
    {
        $request->validate([
            'status'           => ['required', 'string'],
            'cancelled_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $newStatus = $request->input('status');
        $allowed   = self::TRANSITIONS[$appointment->status] ?? [];

        if (! in_array($newStatus, $allowed)) {
            return response()->json([
                'success' => false,
                'message' => "Cannot transition from '{$appointment->status}' to '{$newStatus}'.",
            ], 422);
        }

        if ($newStatus === 'cancelled' && empty($request->input('cancelled_reason'))) {
            return response()->json([
                'success' => false,
                'message' => 'A cancellation reason is required.',
            ], 422);
        }

        DB::transaction(function () use ($appointment, $newStatus, $request) {
            AppointmentStatusLog::create([
                'appointment_id' => $appointment->id,
                'from_status'    => $appointment->status,
                'to_status'      => $newStatus,
                'changed_by'     => auth()->id(),
                'reason'         => $request->input('cancelled_reason'),
            ]);

            $appointment->update([
                'status'           => $newStatus,
                'cancelled_reason' => $newStatus === 'cancelled'
                    ? $request->input('cancelled_reason')
                    : $appointment->cancelled_reason,
            ]);
        });

        return response()->json(['success' => true, 'status' => $newStatus]);
    }

    // ─── availableSlots ───────────────────────────────────────────────────────

    public function availableSlots(Request $request): JsonResponse
    {
        $request->validate([
            'dentist_id' => ['required', 'exists:users,id'],
            'date'       => ['required', 'date'],
        ]);

        $slots = $this->availability->getAvailableSlots(
            (int) $request->dentist_id,
            $request->date
        );

        return response()->json($slots);
    }
}