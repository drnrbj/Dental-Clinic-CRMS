<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    private const PAYMENT_METHODS = ['cash', 'gcash', 'maya', 'bank_transfer', 'card'];
    private const REF_REQUIRED    = ['gcash', 'maya', 'bank_transfer'];

    public function index(): Response
    {
        $pendingInvoices = Appointment::with(['patient', 'dentist', 'treatment'])
            ->where('status', 'completed')
            ->whereHas('treatment')
            ->whereDoesntHave('invoice')
            ->orderByDesc('appointment_date')
            ->get()
            ->map(fn (Appointment $a) => [
                'id'           => $a->id,
                'patient_id'   => $a->patient_id,
                'patient_name' => optional($a->patient)->full_name,
                'dentist_name' => optional($a->dentist)->name,
                'date'         => $a->appointment_date->format('M d, Y'),
                'type'         => ucwords(str_replace('_', ' ', $a->type)),
                'procedure'    => optional($a->treatment)->procedure
                    ? ucwords(str_replace('_', ' ', $a->treatment->procedure)) : '—',
                'cost'         => optional($a->treatment)->treatment_cost ?? 0,
                'cost_display' => '₱' . number_format((float) optional($a->treatment)->treatment_cost ?? 0, 2),
                'treatment_id' => optional($a->treatment)->id,
            ]);

        $invoices = Invoice::with(['patient', 'payments'])
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Invoice $inv) => $this->formatInvoice($inv));

        return Inertia::render('Billing/Index', [
            'pendingInvoices' => $pendingInvoices,
            'invoices'        => $invoices,
        ]);
    }

    public function storeInvoice(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'appointment_id'  => ['required', 'exists:appointments,id'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'discount_reason' => ['nullable', 'string', 'max:255'],
        ]);

        $appointment = Appointment::with('treatment')->findOrFail($validated['appointment_id']);

        if ($appointment->status !== 'completed')
            return back()->withErrors(['appointment_id' => 'Appointment must be completed before invoicing.']);

        if (! $appointment->treatment)
            return back()->withErrors(['appointment_id' => 'No treatment record found for this appointment.']);

        if (Invoice::where('appointment_id', $appointment->id)->exists())
            return back()->withErrors(['appointment_id' => 'An invoice already exists for this appointment.']);

        $discount = (float) ($validated['discount_amount'] ?? 0);
        $subtotal = (float) $appointment->treatment->treatment_cost;

        $invoice = Invoice::create([
            'patient_id'      => $appointment->patient_id,
            'appointment_id'  => $appointment->id,
            'treatment_id'    => $appointment->treatment->id,
            'subtotal'        => $subtotal,
            'discount_amount' => $discount,
            'discount_reason' => $discount > 0 ? ($validated['discount_reason'] ?? null) : null,
            'total_amount'    => 0, // computed in boot()
        ]);

        return redirect()->route('billing.index')
            ->with('success', "Invoice {$invoice->invoice_number} created successfully.");
    }

    public function storePayment(Request $request, Invoice $invoice): RedirectResponse
    {
        $balance = $invoice->balance;

        $rules = [
            'amount_paid'      => ['required', 'numeric', 'min:0.01', "max:{$balance}"],
            'payment_method'   => ['required', 'in:' . implode(',', self::PAYMENT_METHODS)],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'payment_date'     => ['nullable', 'date'],
            'notes'            => ['nullable', 'string', 'max:1000'],
        ];

        if (in_array($request->input('payment_method'), self::REF_REQUIRED)) {
            $rules['reference_number'] = ['required', 'string', 'max:100'];
        }

        $validated = $request->validate($rules);

        Payment::create([
            'invoice_id'       => $invoice->id,
            'patient_id'       => $invoice->patient_id,
            'amount_paid'      => $validated['amount_paid'],
            'payment_method'   => $validated['payment_method'],
            'reference_number' => $validated['reference_number'] ?? null,
            'payment_date'     => $validated['payment_date'] ?? today()->toDateString(),
            'recorded_by'      => auth()->id(),
            'notes'            => $validated['notes'] ?? null,
        ]);

        $label = $invoice->fresh()->payment_status === 'paid' ? 'fully paid' : 'partially paid';

        return redirect()->route('billing.index')
            ->with('success', "Payment recorded. Invoice {$invoice->invoice_number} is now {$label}.");
    }

    public function receipt(Invoice $invoice): Response
    {
        $invoice->load(['patient', 'appointment.dentist', 'treatment', 'payments.recordedBy']);

        return Inertia::render('Billing/Receipt', [
            'invoice' => [
                'id'              => $invoice->id,
                'invoice_number'  => $invoice->invoice_number,
                'created_at'      => $invoice->created_at->format('M d, Y'),
                'subtotal'        => $invoice->subtotal,
                'discount_amount' => $invoice->discount_amount,
                'discount_reason' => $invoice->discount_reason,
                'total_amount'    => $invoice->total_amount,
                'total_paid'      => $invoice->total_paid,
                'balance'         => $invoice->balance,
                'payment_status'  => $invoice->payment_status,
                'patient'         => [
                    'id'             => optional($invoice->patient)->id,
                    'full_name'      => optional($invoice->patient)->full_name,
                    'display_mobile' => optional($invoice->patient)->display_mobile,
                    'email'          => optional($invoice->patient)->email,
                    'address'        => optional($invoice->patient)->address,
                ],
                'appointment'     => $invoice->appointment ? [
                    'formatted_datetime' => $invoice->appointment->formatted_datetime,
                    'type'               => ucwords(str_replace('_', ' ', $invoice->appointment->type)),
                    'dentist_name'       => optional($invoice->appointment->dentist)->name,
                ] : null,
                'treatment'       => $invoice->treatment ? [
                    'procedure_display' => ucwords(str_replace('_', ' ', $invoice->treatment->procedure)),
                    'diagnosis'         => $invoice->treatment->diagnosis,
                ] : null,
                'payments'        => $invoice->payments->map(fn (Payment $p) => [
                    'id'               => $p->id,
                    'amount_paid'      => $p->amount_paid,
                    'payment_method'   => $p->payment_method,
                    'reference_number' => $p->reference_number,
                    'payment_date'     => $p->payment_date->format('M d, Y'),
                    'recorded_by_name' => optional($p->recordedBy)->name,
                    'notes'            => $p->notes,
                ]),
            ],
        ]);
    }

    private function formatInvoice(Invoice $inv): array
    {
        return [
            'id'              => $inv->id,
            'invoice_number'  => $inv->invoice_number,
            'patient_id'      => $inv->patient_id,
            'patient_name'    => optional($inv->patient)->full_name,
            'date'            => $inv->created_at->format('M d, Y'),
            'total_amount'    => $inv->total_amount,
            'total_paid'      => $inv->total_paid,
            'balance'         => $inv->balance,
            'payment_status'  => $inv->payment_status,
            'subtotal'        => $inv->subtotal,
            'discount_amount' => $inv->discount_amount,
            'total_display'   => '₱' . number_format((float) $inv->total_amount, 2),
            'paid_display'    => '₱' . number_format($inv->total_paid, 2),
            'balance_display' => '₱' . number_format($inv->balance, 2),
        ];
    }
}