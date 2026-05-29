<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'birthdate',
        'gender',
        'civil_status',
        'mobile_number',
        'email',
        'address',
        'emergency_contact_name',
        'emergency_contact_relationship',
        'emergency_contact_number',
        'allergies',
        'medical_conditions',
        'current_medications',
        'dentist_notes',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'birthdate'  => 'date',
        'is_active'  => 'boolean',
        'deleted_at' => 'datetime',
    ];

    // ─── Boot: auto-generate patient_code ────────────────────────────────────

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Patient $patient) {
            $year  = now()->year;
            // SQLite does not support lockForUpdate(); use a plain count instead.
            $count = static::withTrashed()
                ->whereYear('created_at', $year)
                ->count() + 1;

            $patient->patient_code = 'PAT-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
        });
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => trim(
                $this->first_name
                . ($this->middle_name ? ' ' . $this->middle_name : '')
                . ' ' . $this->last_name
            ),
        );
    }

    protected function age(): Attribute
    {
        return Attribute::make(
            get: fn () => Carbon::parse($this->birthdate)->age,
        );
    }

    protected function displayMobile(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Format raw 11-digit number → 09XX-XXX-XXXX
                $raw = preg_replace('/\D/', '', $this->mobile_number);
                if (strlen($raw) === 11) {
                    return substr($raw, 0, 4) . '-' . substr($raw, 4, 3) . '-' . substr($raw, 7, 4);
                }
                return $this->mobile_number;
            },
        );
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function treatments(): HasMany
    {
        return $this->hasMany(Treatment::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function isAdmin(): bool
    {
        return false; // on Patient model this is not applicable; see User model
    }
}