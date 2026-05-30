<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        $patients = Patient::where('is_active', true)->get();
        $dentists = User::where('role', 'dentist')->get();
        $admin    = User::where('role', 'admin')->first();

        if ($patients->isEmpty() || $dentists->isEmpty()) {
            $this->command->warn('AppointmentSeeder: no patients or dentists found. Run PatientSeeder first.');
            return;
        }

        $types    = ['cleaning', 'checkup', 'extraction', 'filling', 'root_canal', 'orthodontic', 'whitening', 'consultation'];
        $statuses = ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled', 'no_show'];
        $times    = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

        $now  = Carbon::now();
        $year = $now->year;
        $mon  = $now->month;

        $appointments = [
            ['day' =>  2, 'time' => '08:00', 'status' => 'completed'],
            ['day' =>  3, 'time' => '09:00', 'status' => 'completed'],
            ['day' =>  5, 'time' => '10:00', 'status' => 'completed'],
            ['day' =>  6, 'time' => '11:00', 'status' => 'cancelled'],
            ['day' =>  7, 'time' => '08:00', 'status' => 'no_show'],
            ['day' =>  8, 'time' => '13:00', 'status' => 'completed'],
            ['day' =>  9, 'time' => '14:00', 'status' => 'completed'],
            ['day' => 12, 'time' => '09:00', 'status' => 'confirmed'],
            ['day' => 13, 'time' => '10:00', 'status' => 'confirmed'],
            ['day' => 14, 'time' => '11:00', 'status' => 'pending'],
            ['day' => 15, 'time' => '08:00', 'status' => 'confirmed'],
            ['day' => 16, 'time' => '13:00', 'status' => 'pending'],
            ['day' => 19, 'time' => '09:00', 'status' => 'pending'],
            ['day' => 20, 'time' => '10:00', 'status' => 'confirmed'],
            ['day' => 21, 'time' => '14:00', 'status' => 'pending'],
            ['day' => 22, 'time' => '15:00', 'status' => 'confirmed'],
            ['day' => 23, 'time' => '08:00', 'status' => 'pending'],
            ['day' => 26, 'time' => '09:00', 'status' => 'pending'],
            ['day' => 27, 'time' => '11:00', 'status' => 'confirmed'],
            ['day' => 28, 'time' => '13:00', 'status' => 'pending'],
        ];

        foreach ($appointments as $i => $appt) {
            $patient  = $patients[$i % $patients->count()];
            $dentist  = $dentists[$i % $dentists->count()];
            $type     = $types[$i % count($types)];
            $day      = $appt['day'];

            // Clamp to last day of month
            $lastDay = Carbon::createFromDate($year, $mon, 1)->daysInMonth;
            $day     = min($day, $lastDay);

            $appointment = Appointment::create([
                'patient_id'       => $patient->id,
                'dentist_id'       => $dentist->id,
                'appointment_date' => Carbon::createFromDate($year, $mon, $day)->format('Y-m-d'),
                'appointment_time' => $appt['time'],
                'duration_minutes' => 60,
                'type'             => $type,
                'status'           => $appt['status'],
                'remarks'          => null,
                'cancelled_reason' => $appt['status'] === 'cancelled' ? 'Patient requested reschedule.' : null,
                'created_by'       => $admin->id,
            ]);

            // Seed a status log for non-pending appointments
            if ($appt['status'] !== 'pending') {
                $appointment->statusLogs()->create([
                    'from_status' => 'pending',
                    'to_status'   => $appt['status'],
                    'changed_by'  => $admin->id,
                    'reason'      => null,
                ]);
            }
        }
    }
}