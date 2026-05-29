<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $createdBy = $admin?->id;

        $patients = [
            ['first_name' => 'Maria',     'middle_name' => 'Cruz',      'last_name' => 'Santos',      'birthdate' => '1990-03-15', 'gender' => 'female',          'civil_status' => 'single',   'mobile_number' => '09171234567', 'email' => 'maria.santos@example.com',     'allergies' => 'Penicillin',       'medical_conditions' => 'None',                      'current_medications' => 'None'],
            ['first_name' => 'Juan',      'middle_name' => 'Dela',      'last_name' => 'Cruz',        'birthdate' => '1979-07-22', 'gender' => 'male',            'civil_status' => 'married',  'mobile_number' => '09183456789', 'email' => 'juan.delacruz@example.com',    'allergies' => 'None',             'medical_conditions' => 'Hypertension',              'current_medications' => 'Amlodipine 5mg'],
            ['first_name' => 'Rosario',   'middle_name' => 'Lim',       'last_name' => 'Bautista',    'birthdate' => '1997-11-08', 'gender' => 'female',          'civil_status' => 'single',   'mobile_number' => '09194567890', 'email' => 'rosario.bautista@example.com', 'allergies' => 'Aspirin',          'medical_conditions' => 'Asthma',                    'current_medications' => 'Salbutamol inhaler'],
            ['first_name' => 'Eduardo',   'middle_name' => 'Reyes',     'last_name' => 'Ramos',       'birthdate' => '1972-05-30', 'gender' => 'male',            'civil_status' => 'married',  'mobile_number' => '09205678901', 'email' => null,                           'allergies' => 'None',             'medical_conditions' => 'Diabetes Type 2',           'current_medications' => 'Metformin 500mg'],
            ['first_name' => 'Ligaya',    'middle_name' => 'Gomez',     'last_name' => 'Villanueva',  'birthdate' => '1985-09-14', 'gender' => 'female',          'civil_status' => 'separated','mobile_number' => '09216789012', 'email' => 'ligaya.v@example.com',         'allergies' => 'Latex',            'medical_conditions' => 'None',                      'current_medications' => 'None',    'is_active' => false],
            ['first_name' => 'Carlos',    'middle_name' => 'Diaz',      'last_name' => 'Mendoza',     'birthdate' => '1963-01-25', 'gender' => 'male',            'civil_status' => 'widowed',  'mobile_number' => '09227890123', 'email' => 'carlos.mendoza@example.com',   'allergies' => 'Sulfa drugs',      'medical_conditions' => 'Hypertension, Arthritis',   'current_medications' => 'Losartan 50mg'],
            ['first_name' => 'Analiza',   'middle_name' => 'Tan',       'last_name' => 'Reyes',       'birthdate' => '1995-06-18', 'gender' => 'female',          'civil_status' => 'single',   'mobile_number' => '09238901234', 'email' => 'analiza.reyes@example.com',    'allergies' => 'None',             'medical_conditions' => 'None',                      'current_medications' => 'None'],
            ['first_name' => 'Roberto',   'middle_name' => 'Garcia',    'last_name' => 'Flores',      'birthdate' => '1980-12-03', 'gender' => 'male',            'civil_status' => 'married',  'mobile_number' => '09249012345', 'email' => null,                           'allergies' => 'Ibuprofen',        'medical_conditions' => 'GERD',                      'current_medications' => 'Omeprazole 20mg'],
            ['first_name' => 'Carina',    'middle_name' => 'Torres',    'last_name' => 'Mendoza',     'birthdate' => '1993-04-27', 'gender' => 'female',          'civil_status' => 'single',   'mobile_number' => '09250123456', 'email' => 'carina.mendoza@example.com',   'allergies' => 'None',             'medical_conditions' => 'None',                      'current_medications' => 'None'],
            ['first_name' => 'Danilo',    'middle_name' => 'Aquino',    'last_name' => 'Pascual',     'birthdate' => '1968-08-11', 'gender' => 'male',            'civil_status' => 'married',  'mobile_number' => '09261234567', 'email' => 'danilo.pascual@example.com',   'allergies' => 'None',             'medical_conditions' => 'Hypertension, Diabetes',    'current_medications' => 'Metformin, Enalapril'],
            ['first_name' => 'Natividad', 'middle_name' => 'Soriano',   'last_name' => 'Castillo',    'birthdate' => '1988-02-19', 'gender' => 'female',          'civil_status' => 'married',  'mobile_number' => '09272345678', 'email' => 'naty.castillo@example.com',    'allergies' => 'Codeine',          'medical_conditions' => 'Hypothyroidism',            'current_medications' => 'Levothyroxine 50mcg'],
            ['first_name' => 'Ramon',     'middle_name' => 'Ilagan',    'last_name' => 'Dela Torre',  'birthdate' => '1975-10-06', 'gender' => 'male',            'civil_status' => 'single',   'mobile_number' => '09283456789', 'email' => null,                           'allergies' => 'None',             'medical_conditions' => 'None',                      'current_medications' => 'None'],
            ['first_name' => 'Maribel',   'middle_name' => 'Uy',        'last_name' => 'Navarro',     'birthdate' => '2000-07-14', 'gender' => 'female',          'civil_status' => 'single',   'mobile_number' => '09294567890', 'email' => 'maribel.navarro@example.com',  'allergies' => 'Dust mites',       'medical_conditions' => 'Allergic rhinitis',         'current_medications' => 'Loratadine 10mg'],
            ['first_name' => 'Severino',  'middle_name' => 'Cabrera',   'last_name' => 'Aguilar',     'birthdate' => '1958-03-29', 'gender' => 'male',            'civil_status' => 'married',  'mobile_number' => '09305678901', 'email' => 'severino.aguilar@example.com', 'allergies' => 'None',             'medical_conditions' => 'Heart disease, Hypertension','current_medications' => 'Aspirin 81mg, Atenolol'],
            ['first_name' => 'Josephine', 'middle_name' => 'Macapagal', 'last_name' => 'Buenaventura','birthdate' => '1991-12-22', 'gender' => 'prefer_not_to_say','civil_status' => 'single',  'mobile_number' => '09316789012', 'email' => 'josie.buenaventura@example.com','allergies' => 'None',            'medical_conditions' => 'None',                      'current_medications' => 'None'],
        ];

        foreach ($patients as $data) {
            Patient::create(array_merge([
                'emergency_contact_name'         => 'Emergency Contact',
                'emergency_contact_relationship' => 'Relative',
                'emergency_contact_number'       => '09990001234',
                'address'                        => 'Davao City, Davao del Sur',
                'dentist_notes'                  => null,
                'is_active'                      => true,
                'created_by'                     => $createdBy,
            ], $data));
        }
    }
}