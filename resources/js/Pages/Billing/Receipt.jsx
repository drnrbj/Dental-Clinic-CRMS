import { Head, Link } from '@inertiajs/react'
import { can } from '@/Utils/can'
import EmptyState, { Icons } from '@/Components/EmptyState'
import { SubmitButton } from '@/Components/Spinner'

function peso(val) {
  return '₱' + Number(val ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}

const METHOD_LABELS = {
  cash:          'Cash',
  gcash:         'GCash',
  maya:          'Maya',
  bank_transfer: 'Bank Transfer',
  card:          'Credit / Debit Card',
}

export default function Receipt({ invoice }) {
  const isPaid = invoice.payment_status === 'paid'

  return (
    <>
      <Head title={`Receipt — ${invoice.invoice_number}`} />

      {/* Print styles injected inline — Tailwind's print: modifier isn't enough for display:none */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:p-0 print:m-0">
        {/* Action buttons */}
        <div className="no-print max-w-2xl mx-auto mb-4 flex items-center justify-between">
          <Link href="/billing" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Billing
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
        </div>

        {/* Receipt card */}
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-2xl p-8 print:shadow-none print:rounded-none print:p-6">

          {/* Clinic header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🦷</span>
                <h1 className="text-xl font-bold text-blue-600">BobbyDent Clinic</h1>
              </div>
              <p className="text-xs text-gray-400">Davao City, Davao del Sur</p>
              <p className="text-xs text-gray-400">admin@bobbydent.com</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Receipt</p>
              <p className="text-lg font-bold text-gray-900 font-mono">{invoice.invoice_number}</p>
              <p className="text-xs text-gray-500 mt-0.5">Issued: {invoice.created_at}</p>
              {isPaid ? (
                <span className="inline-flex items-center mt-2 text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase tracking-wide">
                  ✓ Paid in Full
                </span>
              ) : (
                <span className="inline-flex items-center mt-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase tracking-wide">
                  Balance Due
                </span>
              )}
            </div>
          </div>

          {/* Bill to + service info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Bill To</p>
              <p className="text-sm font-semibold text-gray-900">{invoice.patient?.full_name}</p>
              {invoice.patient?.display_mobile && <p className="text-xs text-gray-500 mt-0.5">{invoice.patient.display_mobile}</p>}
              {invoice.patient?.email && <p className="text-xs text-gray-500">{invoice.patient.email}</p>}
              {invoice.patient?.address && <p className="text-xs text-gray-500 mt-0.5">{invoice.patient.address}</p>}
            </div>
            {invoice.appointment && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Service</p>
                <p className="text-sm text-gray-700">{invoice.appointment.formatted_datetime}</p>
                <p className="text-xs text-gray-500 mt-0.5">{invoice.appointment.type}</p>
                <p className="text-xs text-gray-500">{invoice.appointment.dentist_name}</p>
              </div>
            )}
          </div>

          {/* Items table */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">Description</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="py-3">
                  <p className="font-medium text-gray-900">
                    {invoice.treatment?.procedure_display ?? invoice.appointment?.type ?? 'Dental Service'}
                  </p>
                  {invoice.treatment?.diagnosis && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{invoice.treatment.diagnosis}</p>
                  )}
                </td>
                <td className="py-3 text-right font-medium text-gray-900">{peso(invoice.subtotal)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-3 text-sm text-gray-500">Subtotal</td>
                <td className="pt-3 text-right text-sm text-gray-700 font-medium">{peso(invoice.subtotal)}</td>
              </tr>
              {parseFloat(invoice.discount_amount) > 0 && (
                <tr>
                  <td className="pt-1 text-sm text-green-600">
                    Discount {invoice.discount_reason && <span className="text-xs text-gray-400">— {invoice.discount_reason}</span>}
                  </td>
                  <td className="pt-1 text-right text-sm text-green-600 font-medium">− {peso(invoice.discount_amount)}</td>
                </tr>
              )}
              <tr className="border-t-2 border-gray-200">
                <td className="pt-3 text-base font-bold text-gray-900">Total</td>
                <td className="pt-3 text-right text-base font-bold text-gray-900">{peso(invoice.total_amount)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Payments received */}
          {invoice.payments?.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Payments Received</p>
              <div className="space-y-2">
                {invoice.payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-700 font-medium">{METHOD_LABELS[p.payment_method] ?? p.payment_method}</span>
                      {p.reference_number && <span className="text-xs text-gray-400 ml-2 font-mono">#{p.reference_number}</span>}
                      <span className="text-xs text-gray-400 ml-2">{p.payment_date}</span>
                    </div>
                    <span className="font-semibold text-green-700">{peso(p.amount_paid)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Balance / Paid in full */}
          <div className={`rounded-xl p-4 flex items-center justify-between ${isPaid ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
            <span className={`text-sm font-bold ${isPaid ? 'text-green-700' : 'text-red-700'}`}>
              {isPaid ? '✓ Paid in Full' : 'Outstanding Balance'}
            </span>
            <span className={`text-lg font-bold ${isPaid ? 'text-green-700' : 'text-red-700'}`}>
              {isPaid ? peso(invoice.total_amount) : peso(invoice.balance)}
            </span>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">Thank you for choosing BobbyDent Clinic.</p>
            <p className="text-xs text-gray-400 mt-0.5">This is an official receipt. Please keep for your records.</p>
          </div>
        </div>
      </div>
    </>
  )
}