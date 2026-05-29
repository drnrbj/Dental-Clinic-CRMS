<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@bobbydent.com'],
            [
                'name'     => 'Dr. Bobby Reyes',
                'password' => Hash::make('password'),
                'role'     => 'admin',
            ]
        );

        // Create receptionist
        User::firstOrCreate(
            ['email' => 'receptionist@bobbydent.com'],
            [
                'name'     => 'Ana Lim',
                'password' => Hash::make('password'),
                'role'     => 'receptionist',
            ]
        );

        // Create dentist
        User::firstOrCreate(
            ['email' => 'dentist@bobbydent.com'],
            [
                'name'     => 'Dr. Marco Santos',
                'password' => Hash::make('password'),
                'role'     => 'dentist',
            ]
        );

        $this->call([
            PatientSeeder::class,
        ]);
    }
}