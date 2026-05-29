<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            [
                'label'      => 'Total Patients',
                'value'      => '245',
                'trend'      => '+8% this month',
                'trendColor' => 'green',
                'icon'       => 'users',
            ],
            [
                'label'      => "Today's Appointments",
                'value'      => '12',
                'trend'      => '3 remaining',
                'trendColor' => 'blue',
                'icon'       => 'calendar',
            ],
            [
                'label'      => 'Completed Treatments',
                'value'      => '1,280',
                'trend'      => 'this year',
                'trendColor' => 'gray',
                'icon'       => 'check',
            ],
            [
                'label'      => 'Monthly Revenue',
                'value'      => '₱42,500',
                'trend'      => '+12% vs last month',
                'trendColor' => 'green',
                'icon'       => 'peso',
            ],
        ];

        $weeklyData = [
            ['day' => 'Mon', 'count' => 8],
            ['day' => 'Tue', 'count' => 12],
            ['day' => 'Wed', 'count' => 7],
            ['day' => 'Thu', 'count' => 15],
            ['day' => 'Fri', 'count' => 11],
            ['day' => 'Sat', 'count' => 6],
        ];

        $recentAppointments = [
            [
                'patient'   => 'Maria Santos',
                'dentist'   => 'Dr. Jose Reyes',
                'datetime'  => 'May 29, 2026 09:00 AM',
                'type'      => 'Cleaning',
                'status'    => 'completed',
            ],
            [
                'patient'   => 'Juan dela Cruz',
                'dentist'   => 'Dr. Ana Lim',
                'datetime'  => 'May 29, 2026 10:30 AM',
                'type'      => 'Extraction',
                'status'    => 'confirmed',
            ],
            [
                'patient'   => 'Rosario Bautista',
                'dentist'   => 'Dr. Jose Reyes',
                'datetime'  => 'May 29, 2026 11:00 AM',
                'type'      => 'Braces Adjustment',
                'status'    => 'pending',
            ],
            [
                'patient'   => 'Eduardo Ramos',
                'dentist'   => 'Dr. Ana Lim',
                'datetime'  => 'May 29, 2026 01:00 PM',
                'type'      => 'Root Canal',
                'status'    => 'confirmed',
            ],
            [
                'patient'   => 'Ligaya Villanueva',
                'dentist'   => 'Dr. Jose Reyes',
                'datetime'  => 'May 28, 2026 03:00 PM',
                'type'      => 'Tooth Filling',
                'status'    => 'no_show',
            ],
        ];

        $todaySchedule = [
            [
                'time'      => '09:00 AM',
                'patient'   => 'Maria Santos',
                'procedure' => 'Dental Cleaning',
                'current'   => false,
            ],
            [
                'time'      => '10:30 AM',
                'patient'   => 'Juan dela Cruz',
                'procedure' => 'Tooth Extraction',
                'current'   => true,
            ],
            [
                'time'      => '11:00 AM',
                'patient'   => 'Rosario Bautista',
                'procedure' => 'Braces Adjustment',
                'current'   => false,
            ],
            [
                'time'      => '01:00 PM',
                'patient'   => 'Eduardo Ramos',
                'procedure' => 'Root Canal',
                'current'   => false,
            ],
            [
                'time'      => '03:30 PM',
                'patient'   => 'Carina Mendoza',
                'procedure' => 'Tooth Whitening',
                'current'   => false,
            ],
        ];

        return Inertia::render('Dashboard', [
            'stats'               => $stats,
            'weeklyData'          => $weeklyData,
            'recentAppointments'  => $recentAppointments,
            'todaySchedule'       => $todaySchedule,
        ]);
    }
}