<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('dentist_id')->constrained('users')->cascadeOnDelete();
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->unsignedInteger('duration_minutes')->default(60);
            // String instead of enum for SQLite compatibility.
            // Allowed: cleaning, checkup, extraction, filling, root_canal, orthodontic, whitening, consultation
            $table->string('type');
            // Allowed: pending, confirmed, ongoing, completed, cancelled, no_show
            $table->string('status')->default('pending');
            $table->text('remarks')->nullable();
            $table->text('cancelled_reason')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['dentist_id', 'appointment_date']);
            $table->index(['patient_id', 'appointment_date']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};