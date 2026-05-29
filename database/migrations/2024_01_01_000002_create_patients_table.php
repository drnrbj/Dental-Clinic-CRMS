<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('patient_code')->unique();
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('last_name', 100);
            $table->date('birthdate');
            $table->string('gender');         // male | female | prefer_not_to_say
            $table->string('civil_status')->nullable(); // single | married | widowed | separated
            $table->string('mobile_number', 20);
            $table->string('email', 150)->nullable();
            $table->text('address')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_relationship', 50)->nullable();
            $table->string('emergency_contact_number', 20)->nullable();
            $table->text('allergies')->nullable();
            $table->text('medical_conditions')->nullable();
            $table->text('current_medications')->nullable();
            $table->text('dentist_notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};