<?php

namespace App\Observers;

use App\Models\AppointmentStatusLog;
use App\Models\Treatment;
use Illuminate\Support\Facades\Auth;

class TreatmentObserver
{
    /**
     * When a treatment is recorded, automatically mark the linked
     * appointment as completed and write a status log entry.
     */
    public function created(Treatment $treatment): void
    {
        $appointment = $treatment->appointment;

        if (! $appointment) {
            return;
        }

        // Only transition if the appointment is currently ongoing
        if ($appointment->status !== 'ongoing') {
            return;
        }

        $previousStatus = $appointment->status;

        $appointment->update(['status' => 'completed']);

        AppointmentStatusLog::create([
            'appointment_id' => $appointment->id,
            'from_status'    => $previousStatus,
            'to_status'      => 'completed',
            'changed_by'     => Auth::id() ?? $treatment->dentist_id,
            'reason'         => 'Treatment recorded — appointment auto-completed.',
        ]);
    }
}