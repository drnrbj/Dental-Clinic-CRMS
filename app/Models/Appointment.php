<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'dentist_id',
        'appointment_date',
        'appointment_time',
        'duration_minutes',
        'type',
        'status',
        'remarks',
        'cancelled_reason',
        'created_by',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'duration_minutes' => 'integer',
        'deleted_at'       => 'datetime',
    ];

    // ─── Accessors ────────────────────────────────────────────────────────────

    protected function formattedDatetime(): Attribute
    {
        return Attribute::make(
            get: function () {
                $date = Carbon::parse($this->appointment_date)->format('M d, Y');
                $time = Carbon::createFromTimeString($this->appointment_time)->format('g:i A');
                return "{$date} at {$time}";
            }
        );
    }

    protected function timeSlot(): Attribute
    {
        return Attribute::make(
            get: function () {
                $start = Carbon::createFromTimeString($this->appointment_time);
                $end   = $start->copy()->addMinutes($this->duration_minutes);
                return $start->format('g:i A') . ' – ' . $end->format('g:i A');
            }
        );
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeForDate($query, string $date)
    {
        return $query->whereDate('appointment_date', $date);
    }

    public function scopeForDentist($query, int $dentistId)
    {
        return $query->where('dentist_id', $dentistId);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dentist_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(AppointmentStatusLog::class)->orderBy('created_at');
    }

    public function invoice(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(\App\Models\Invoice::class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function isEditable(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }

    /**
     * Map to FullCalendar event format.
     */
    public function toCalendarEvent(): array
    {
        $colorMap = [
            'pending'   => '#ca8a04',
            'confirmed' => '#2563eb',
            'ongoing'   => '#7c3aed',
            'completed' => '#16a34a',
            'cancelled' => '#dc2626',
            'no_show'   => '#6b7280',
        ];

        return [
            'id'    => $this->id,
            'title' => optional($this->patient)->full_name . ' – ' . ucfirst(str_replace('_', ' ', $this->type)),
            'start' => $this->appointment_date->format('Y-m-d') . 'T' . $this->appointment_time,
            'end'   => $this->appointment_date->format('Y-m-d') . 'T'
                       . Carbon::createFromTimeString($this->appointment_time)
                                ->addMinutes($this->duration_minutes)
                                ->format('H:i:s'),
            'color'          => $colorMap[$this->status] ?? '#2563eb',
            'extendedProps'  => [
                'id'      => $this->id,
                'status'  => $this->status,
                'patient' => optional($this->patient)->full_name,
                'dentist' => optional($this->dentist)->name,
            ],
        ];
    }
}