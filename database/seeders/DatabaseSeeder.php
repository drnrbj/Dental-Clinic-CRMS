<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed users
        User::firstOrCreate(
            ['email' => 'admin@bobbydent.com'],
            ['name' => 'Admin Cruz', 'password' => Hash::make('password'), 'role' => 'admin']
        );
        User::firstOrCreate(
            ['email' => 'reception@bobbydent.com'],
            ['name' => 'Maria Gonzales', 'password' => Hash::make('password'), 'role' => 'receptionist']
        );
        User::firstOrCreate(
            ['email' => 'dentist@bobbydent.com'],
            ['name' => 'Dr. Ana Reyes', 'password' => Hash::make('password'), 'role' => 'dentist']
        );

        $this->call([
            PatientSeeder::class,
            AppointmentSeeder::class,
        ]);
    }
}