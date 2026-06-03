<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Receipt — {{ $invoice->invoice_number }}</title>
  <style>
    /*
     * DejaVu Sans is bundled with DomPDF and is the only font that
     * correctly renders the ₱ (Philippine Peso) symbol.
     * Do NOT use Tailwind, Google Fonts, or any external CSS here.
     */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'DejaVu Sans', sans-serif;
      font-size: 12px;
      color: #111827;
      background: #ffffff;
      padding: 40px;
      line-height: 1.5;
    }

    /* ── Utility ────────────────────────────────────────────────── */
    .text-right  { text-align: right; }
    .text-center { text-align: center; }
    .text-left   { text-align: left; }
    .font-bold   { font-weight: 700; }
    .font-medium { font-weight: 500; }

    /* ── Clinic header ──────────────────────────────────────────── */
    .header-row {
      width: 100%;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    .header-table {
      width: 100%;
    }

    .clinic-name {
      font-size: 20px;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 2px;
    }

    .clinic-meta {
      font-size: 10px;
      color: #9ca3af;
      margin-top: 2px;
    }

    .invoice-ref {
      text-align: right;
    }

    .invoice-ref-label {
      font-size: 9px;
      font-weight: 700;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 2px;
    }

    .invoice-number {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      font-family: 'DejaVu Sans Mono', monospace;
    }

    .invoice-date {
      font-size: 10px;
      color: #6b7280;
      margin-top: 2px;
    }

    /* ── Status badge ───────────────────────────────────────────── */
    .badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 3px 10px;
      border-radius: 999px;
      margin-top: 6px;
    }

    .badge-paid {
      background-color: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .badge-unpaid {
      background-color: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    .badge-partial {
      background-color: #fefce8;
      color: #a16207;
      border: 1px solid #fde68a;
    }

    /* ── Bill-to / Service info ─────────────────────────────────── */
    .info-table {
      width: 100%;
      margin-bottom: 24px;
    }

    .info-section-label {
      font-size: 9px;
      font-weight: 700;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 5px;
    }

    .info-name {
      font-size: 12px;
      font-weight: 700;
      color: #111827;
    }

    .info-detail {
      font-size: 10px;
      color: #6b7280;
      margin-top: 2px;
    }

    /* ── Items table ────────────────────────────────────────────── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .items-table thead tr {
      border-bottom: 2px solid #374151;
    }

    .items-table th {
      font-size: 9px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding-bottom: 8px;
    }

    .items-table td {
      padding: 10px 0;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: top;
    }

    .item-procedure {
      font-weight: 600;
      color: #111827;
      font-size: 12px;
    }

    .item-diagnosis {
      font-size: 10px;
      color: #9ca3af;
      margin-top: 2px;
    }

    /* ── Totals section ─────────────────────────────────────────── */
    .totals-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }

    .totals-table td {
      padding: 3px 0;
      font-size: 12px;
    }

    .totals-table .total-row td {
      border-top: 2px solid #374151;
      padding-top: 8px;
      font-size: 14px;
      font-weight: 700;
    }

    .discount-label {
      color: #15803d;
    }

    .discount-amount {
      color: #15803d;
      text-align: right;
    }

    /* ── Payments received ──────────────────────────────────────── */
    .payments-section {
      margin-bottom: 24px;
    }

    .payments-label {
      font-size: 9px;
      font-weight: 700;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }

    .payment-row-table {
      width: 100%;
      border-collapse: collapse;
    }

    .payment-row-table td {
      padding: 4px 0;
      font-size: 11px;
      border-bottom: 1px solid #f9fafb;
    }

    .payment-method {
      font-weight: 600;
      color: #374151;
    }

    .payment-ref {
      font-family: 'DejaVu Sans Mono', monospace;
      font-size: 9px;
      color: #9ca3af;
      margin-left: 6px;
    }

    .payment-date {
      font-size: 10px;
      color: #9ca3af;
      margin-left: 6px;
    }

    .payment-amount {
      text-align: right;
      font-weight: 700;
      color: #15803d;
    }

    /* ── Balance box ────────────────────────────────────────────── */
    .balance-box {
      width: 100%;
      padding: 14px 18px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .balance-box-paid {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
    }

    .balance-box-due {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
    }

    .balance-table {
      width: 100%;
    }

    .balance-label-paid {
      font-size: 13px;
      font-weight: 700;
      color: #15803d;
    }

    .balance-label-due {
      font-size: 13px;
      font-weight: 700;
      color: #b91c1c;
    }

    .balance-amount-paid {
      text-align: right;
      font-size: 16px;
      font-weight: 700;
      color: #15803d;
    }

    .balance-amount-due {
      text-align: right;
      font-size: 16px;
      font-weight: 700;
      color: #b91c1c;
    }

    /* ── Footer ─────────────────────────────────────────────────── */
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
      text-align: center;
    }

    .footer p {
      font-size: 9px;
      color: #9ca3af;
      margin-top: 2px;
    }
  </style>
</head>
<body>

  {{-- ── Clinic header ── --}}
  <div class="header-row">
    <table class="header-table">
      <tr>
        <td style="width:60%">
          <div class="clinic-name">&#x1F9B7; BobbyDent Clinic</div>
          <div class="clinic-meta">Davao City, Davao del Sur</div>
          <div class="clinic-meta">admin@bobbydent.com</div>
        </td>
        <td class="invoice-ref" style="width:40%">
          <div class="invoice-ref-label">Official Receipt</div>
          <div class="invoice-number">{{ $invoice->invoice_number }}</div>
          <div class="invoice-date">Issued: {{ $invoice->created_at->format('F d, Y') }}</div>
          <div>
            @if($invoice->payment_status === 'paid')
              <span class="badge badge-paid">&#x2713; Paid in Full</span>
            @elseif($invoice->payment_status === 'partial')
              <span class="badge badge-partial">Partially Paid</span>
            @else
              <span class="badge badge-unpaid">Balance Due</span>
            @endif
          </div>
        </td>
      </tr>
    </table>
  </div>

  {{-- ── Bill to + Service info ── --}}
  <table class="info-table">
    <tr>
      <td style="width:50%; vertical-align:top; padding-right:20px">
        <div class="info-section-label">Bill To</div>
        <div class="info-name">{{ optional($invoice->patient)->full_name ?? '—' }}</div>
        @if(optional($invoice->patient)->display_mobile)
          <div class="info-detail">{{ $invoice->patient->display_mobile }}</div>
        @endif
        @if(optional($invoice->patient)->email)
          <div class="info-detail">{{ $invoice->patient->email }}</div>
        @endif
        @if(optional($invoice->patient)->address)
          <div class="info-detail">{{ $invoice->patient->address }}</div>
        @endif
      </td>

      @if($invoice->appointment)
      <td style="width:50%; vertical-align:top">
        <div class="info-section-label">Service</div>
        <div class="info-name">{{ $invoice->appointment->formatted_datetime }}</div>
        <div class="info-detail">{{ ucwords(str_replace('_', ' ', $invoice->appointment->type)) }}</div>
        <div class="info-detail">{{ optional($invoice->appointment->dentist)->name }}</div>
      </td>
      @endif
    </tr>
  </table>

  {{-- ── Items table ── --}}
  <table class="items-table">
    <thead>
      <tr>
        <th class="text-left">Description</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div class="item-procedure">
            {{ $invoice->treatment?->procedure
                ? ucwords(str_replace('_', ' ', $invoice->treatment->procedure))
                : (optional($invoice->appointment)->type
                    ? ucwords(str_replace('_', ' ', $invoice->appointment->type))
                    : 'Dental Service') }}
          </div>
          @if($invoice->treatment?->diagnosis)
            <div class="item-diagnosis">{{ Str::limit($invoice->treatment->diagnosis, 120) }}</div>
          @endif
        </td>
        <td class="text-right font-medium">&#x20B1;{{ number_format((float)$invoice->subtotal, 2) }}</td>
      </tr>
    </tbody>
  </table>

  {{-- ── Totals ── --}}
  <table class="totals-table">
    <tr>
      <td style="color:#6b7280">Subtotal</td>
      <td class="text-right font-medium" style="color:#374151">&#x20B1;{{ number_format((float)$invoice->subtotal, 2) }}</td>
    </tr>

    @if((float)$invoice->discount_amount > 0)
    <tr>
      <td class="discount-label">
        Discount
        @if($invoice->discount_reason)
          <span style="font-size:10px; color:#9ca3af"> — {{ $invoice->discount_reason }}</span>
        @endif
      </td>
      <td class="discount-amount">&#8722; &#x20B1;{{ number_format((float)$invoice->discount_amount, 2) }}</td>
    </tr>
    @endif

    <tr class="total-row">
      <td>Total</td>
      <td class="text-right">&#x20B1;{{ number_format((float)$invoice->total_amount, 2) }}</td>
    </tr>
  </table>

  {{-- ── Payments received ── --}}
  @if($invoice->payments->count() > 0)
  <div class="payments-section">
    <div class="payments-label">Payments Received</div>
    <table class="payment-row-table">
      @foreach($invoice->payments as $payment)
      <tr>
        <td>
          <span class="payment-method">
            @switch($payment->payment_method)
              @case('cash') Cash @break
              @case('gcash') GCash @break
              @case('maya') Maya @break
              @case('bank_transfer') Bank Transfer @break
              @case('card') Credit / Debit Card @break
              @default {{ ucfirst($payment->payment_method) }}
            @endswitch
          </span>
          @if($payment->reference_number)
            <span class="payment-ref">#{{ $payment->reference_number }}</span>
          @endif
          <span class="payment-date">{{ $payment->payment_date->format('M d, Y') }}</span>
        </td>
        <td class="payment-amount">&#x20B1;{{ number_format((float)$payment->amount_paid, 2) }}</td>
      </tr>
      @endforeach
    </table>
  </div>
  @endif

  {{-- ── Balance box ── --}}
  @php $isPaid = $invoice->payment_status === 'paid'; @endphp
  <div class="balance-box {{ $isPaid ? 'balance-box-paid' : 'balance-box-due' }}">
    <table class="balance-table">
      <tr>
        <td class="{{ $isPaid ? 'balance-label-paid' : 'balance-label-due' }}">
          {{ $isPaid ? '✓ Paid in Full' : 'Outstanding Balance' }}
        </td>
        <td class="{{ $isPaid ? 'balance-amount-paid' : 'balance-amount-due' }}">
          &#x20B1;{{ $isPaid
            ? number_format((float)$invoice->total_amount, 2)
            : number_format((float)$invoice->balance, 2) }}
        </td>
      </tr>
    </table>
  </div>

  {{-- ── Footer ── --}}
  <div class="footer">
    <p>Thank you for choosing BobbyDent Clinic.</p>
    <p>This is an official receipt. Please keep for your records.</p>
    <p style="margin-top:6px; color:#d1d5db;">Generated {{ now()->format('F d, Y \a\t g:i A') }}</p>
  </div>

</body>
</html>