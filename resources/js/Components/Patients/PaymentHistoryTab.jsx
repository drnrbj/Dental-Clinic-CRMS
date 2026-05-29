function InvoiceStatusBadge({ status }) {
  const config = {
    paid:         { label: 'Paid',         className: 'bg-green-50 text-green-700' },
    partial:      { label: 'Partial',       className: 'bg-yellow-50 text-yellow-700' },
    unpaid:       { label: 'Unpaid',        className: 'bg-red-50 text-red-700' },
    cancelled:    { label: 'Cancelled',     className: 'bg-gray-100 text-gray-500' },
  }
  const c = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' }

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${c.className}`}>
      {c.label}
    </span>
  )
}

function peso(amount) {
  return '₱' + Number(amount ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}

export default function PaymentHistoryTab({ invoices }) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
        <p className="text-gray-400 text-sm font-medium">No payment records</p>
        <p className="text-gray-300 text-xs mt-1">Invoices will appear here once billing is added.</p>
      </div>
    )
  }

  const totalPaid       = invoices.reduce((sum, i) => sum + Number(i.amount_paid ?? 0), 0)
  const totalOutstanding = invoices.reduce((sum, i) => sum + Number(i.balance ?? 0), 0)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide pb-3 pr-4">Invoice #</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide pb-3 pr-4">Date</th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide pb-3 pr-4">Total</th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide pb-3 pr-4">Paid</th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide pb-3 pr-4">Balance</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4 font-mono text-xs text-gray-600 whitespace-nowrap">{inv.invoice_number}</td>
                <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{inv.invoice_date}</td>
                <td className="py-3 pr-4 text-right text-gray-800 whitespace-nowrap font-medium">{peso(inv.total_amount)}</td>
                <td className="py-3 pr-4 text-right text-green-700 whitespace-nowrap">{peso(inv.amount_paid)}</td>
                <td className="py-3 pr-4 text-right text-red-600 whitespace-nowrap font-medium">{peso(inv.balance)}</td>
                <td className="py-3">
                  <InvoiceStatusBadge status={inv.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Paid</span>
          <span className="text-sm font-bold text-green-700">{peso(totalPaid)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Outstanding</span>
          <span className="text-sm font-bold text-red-600">{peso(totalOutstanding)}</span>
        </div>
      </div>
    </div>
  )
}