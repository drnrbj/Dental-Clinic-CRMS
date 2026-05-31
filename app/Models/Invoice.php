<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'appointment_id',
        'treatment_id',
        'subtotal',
        'discount_amount',
        'discount_reason',
        'total_amount',
    ];

    protected $casts = [
        'subtotal'        => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount'    => 'decimal:2',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Invoice $invoice) {
            $year  = now()->year;
            $count = static::whereYear('created_at', $year)->count() + 1;
            $invoice->invoice_number = 'INV-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
            $invoice->total_amount   = max(0, (float) $invoice->subtotal - (float) $invoice->discount_amount);
        });

        static::updating(function (Invoice $invoice) {
            $invoice->total_amount = max(0, (float) $invoice->subtotal - (float) $invoice->discount_amount);
        });
    }

    protected function totalPaid(): Attribute
    {
        return Attribute::make(
            get: fn () => (float) $this->payments()->sum('amount_paid'),
        );
    }

    protected function balance(): Attribute
    {
        return Attribute::make(
            get: fn () => max(0, (float) $this->total_amount - $this->total_paid),
        );
    }

    protected function paymentStatus(): Attribute
    {
        return Attribute::make(
            get: function () {
                $paid  = $this->total_paid;
                $total = (float) $this->total_amount;
                if ($paid <= 0)      return 'unpaid';
                if ($paid >= $total) return 'paid';
                return 'partial';
            },
        );
    }

    public function patient(): BelongsTo    { return $this->belongsTo(Patient::class); }
    public function appointment(): BelongsTo { return $this->belongsTo(Appointment::class); }
    public function treatment(): BelongsTo  { return $this->belongsTo(Treatment::class); }
    public function payments(): HasMany     { return $this->hasMany(Payment::class)->orderBy('payment_date'); }
}