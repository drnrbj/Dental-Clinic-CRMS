<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'patient_id',
        'amount_paid',
        'payment_method',
        'reference_number',
        'payment_date',
        'recorded_by',
        'notes',
    ];

    protected $casts = [
        'amount_paid'  => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function invoice(): BelongsTo   { return $this->belongsTo(Invoice::class); }
    public function patient(): BelongsTo   { return $this->belongsTo(Patient::class); }
    public function recordedBy(): BelongsTo { return $this->belongsTo(User::class, 'recorded_by'); }
}