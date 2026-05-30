<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('treatments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')
                  ->unique()
                  ->constrained('appointments')
                  ->cascadeOnDelete();
            $table->foreignId('patient_id')
                  ->constrained('patients')
                  ->cascadeOnDelete();
            $table->foreignId('dentist_id')
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->text('diagnosis');
            // String instead of enum for SQLite compatibility.
            // Allowed: cleaning, extraction, filling, root_canal, crown,
            //          whitening, braces_adjustment, consultation
            $table->string('procedure');
            $table->text('prescription')->nullable();
            $table->text('clinical_notes')->nullable();
            $table->decimal('treatment_cost', 10, 2);
            $table->timestamps();

            $table->index(['patient_id', 'created_at']);
            $table->index(['dentist_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('treatments');
    }
};