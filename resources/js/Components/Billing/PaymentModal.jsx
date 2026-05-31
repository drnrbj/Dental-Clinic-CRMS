import { useEffect } from 'react'
import { useForm } from '@inertiajs/react'

const METHODS = [
  { value: 'cash',          label: 'Cash' },
  { value: 'gcash',         label: 'GCash' },
  { value: 'maya',          label: 'Maya' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'card',          label: 'Credit / Debit Card' },
]

const REF_REQUIRED = ['gcash', 'maya', 'bank_transfer']

export default function PaymentModal({ open, onClose, invoice }) {
  const today = new Date().toISOString().split('T')[0]

  const form = useForm({
    amount_paid:      invoice?.balance ?? '',
    payment_method:   'cash',
    reference_number: '',
    payment_date:     today,
    notes:            '',
  })

  useEffect(() => {
    if (invoice?.balance) form.setData('amount_paid', parseFloat(invoice.balance).toFixed(2))
  }, [invoice?.id])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    form.post(`/billing/invoices/${invoice.id}/payments`, {
      onSuccess: () => { form.reset(); onClose() },
    })
  }

  if (!open) return null

  const needsRef = REF_REQUIRED.includes(form.data.payment_method)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-gray-900">Record Payment</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{invoice?.invoice_number}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Invoice summary */}
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{invoice?.total_display}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Paid</p>
              <p className="text-sm font-bold text-green-600 mt-0.5">{invoice?.paid_display}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Balance</p>
              <p className="text-sm font-bold text-red-600 mt-0.5">{invoice?.balance_display}</p>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount<span className="text-red-500 ml-0.5">*</span></label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white">
              <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border-r border-gray-200 font-medium">₱</span>
              <input type="number" min="0.01" step="0.01" max={invoice?.balance}
                value={form.data.amount_paid}
                onChange={e => form.setData('amount_paid', e.target.value)}
                className="flex-1 px-3 py-2 text-sm focus:outline-none placeholder-gray-400"
                placeholder="0.00" />
            </div>
            {form.errors.amount_paid && <p className="text-red-500 text-xs mt-1">{form.errors.amount_paid}</p>}
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method<span className="text-red-500 ml-0.5">*</span></label>
            <select value={form.data.payment_method} onChange={e => { form.setData('payment_method', e.target.value); form.setData('reference_number', '') }}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">
              {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            {form.errors.payment_method && <p className="text-red-500 text-xs mt-1">{form.errors.payment_method}</p>}
          </div>

          {/* Reference number — conditional */}
          {needsRef && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input type="text"
                value={form.data.reference_number}
                onChange={e => form.setData('reference_number', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                placeholder={`${form.data.payment_method === 'gcash' ? 'GCash' : form.data.payment_method === 'maya' ? 'Maya' : 'Bank'} reference number`} />
              {form.errors.reference_number && <p className="text-red-500 text-xs mt-1">{form.errors.reference_number}</p>}
            </div>
          )}

          {/* Payment date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
            <input type="date" value={form.data.payment_date} onChange={e => form.setData('payment_date', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.data.notes} onChange={e => form.setData('notes', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none"
              rows={2} placeholder="Optional payment notes..." />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={form.processing}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg transition-colors">
              {form.processing ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Recording...</>
              ) : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}