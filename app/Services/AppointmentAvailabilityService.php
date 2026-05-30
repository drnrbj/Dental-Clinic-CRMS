<?php

namespace App\Services;

use App\Models\Appointment;
use Carbon\Carbon;

class AppointmentAvailabilityService
{
    /**
     * Check whether a dentist already has an overlapping appointment.
     *
     * Uses Carbon for all time arithmetic to stay SQLite-compatible —
     * no raw SQL time functions or DB-level enum checks.
     *
     * @param  int         $dentistId
     * @param  string      $date       Y-m-d
     * @param  string      $time       H:i or H:i:s
     * @param  int         $duration   minutes (default 60)
     * @param  int|null    $excludeId  appointment to ignore (for updates)
     */
    public function hasConflict(
        int    $dentistId,
        string $date,
        string $time,
        int    $duration   = 60,
        ?int   $excludeId  = null
    ): bool {
        $newStart = Carbon::createFromTimeString($time);
        $newEnd   = $newStart->copy()->addMinutes($duration);

        $existing = Appointment::query()
            ->where('dentist_id', $dentistId)
            ->whereDate('appointment_date', $date)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->get(['appointment_time', 'duration_minutes']);

        foreach ($existing as $appt) {
            $existStart = Carbon::createFromTimeString($appt->appointment_time);
            $existEnd   = $existStart->copy()->addMinutes($appt->duration_minutes);

            // Overlap condition: newStart < existEnd && newEnd > existStart
            if ($newStart->lt($existEnd) && $newEnd->gt($existStart)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Return all 1-hour slots for a dentist on a given date,
     * marking each as available or not.
     *
     * @param  int    $dentistId
     * @param  string $date       Y-m-d
     * @return array<int, array{time: string, label: string, available: bool}>
     */
    public function getAvailableSlots(int $dentistId, string $date): array
    {
        $slots = [];
        $start = Carbon::createFromTime(8, 0);  // 08:00
        $end   = Carbon::createFromTime(17, 0); // 17:00 (last slot starts at 16:00)

        while ($start->lt($end)) {
            $timeStr = $start->format('H:i');
            $slots[] = [
                'time'      => $timeStr,
                'label'     => $start->format('g:i A'),
                'available' => ! $this->hasConflict($dentistId, $date, $timeStr),
            ];
            $start->addHour();
        }

        return $slots;
    }
}