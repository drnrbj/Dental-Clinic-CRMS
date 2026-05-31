import { useEffect, useState } from 'react'
import { useForm } from '@inertiajs/react'

export function InvoiceModal({ open, onClose, appointment }) {
  const [discount, setDiscount] = useState(0)

  const form = useForm({
    appointment_id:  appointment?.id ?? '',
    discount_amount: 0,
    discount_reason: '',
  })

  const subtotal   = parseFloat(appointment?.cost ?? 0)
  const totalAfter = Math.max(0, subtotal - discount)

  useEffect(() => {
    if (appointment?.id) form.setData('appointment_id', appointment.id)
  }, [appointment?.id])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleDiscountChange = (val) => {
    const n = Math.max(0, parseFloat(val) || 0)
    setDiscount(n)
    form.setData('discount_amount', n)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    form.post('/billing/invoices', { onSuccess: () => { form.reset(); onClose() } })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-gray-900">Create Invoice</h2>
            <p className="text-xs text-gray-500 mt-0.5">Review and confirm invoice details</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Appointment context */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Appointment</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><p className="text-xs text-blue-500 font-medium">Patient</p><p className="text-blue-900 font-semibold mt-0.5">{appointment?.patient_name}</p></div>
              <div><p className="text-xs text-blue-500 font-medium">Date</p><p className="text-blue-900 mt-0.5">{appointment?.date}</p></div>
              <div><p className="text-xs text-blue-500 font-medium">Procedure</p><p className="text-blue-900 mt-0.5">{appointment?.procedure}</p></div>
              <div><p className="text-xs text-blue-500 font-medium">Dentist</p><p className="text-blue-900 mt-0.5">{appointment?.dentist_name}</p></div>
            </div>
          </div>

          {/* Subtotal display */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Treatment Cost</span>
            <span className="text-sm font-semibold text-gray-900">₱{subtotal.toFixed(2)}</span>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white">
              <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border-r border-gray-200 font-medium">₱</span>
              <input type="number" min="0" step="0.01" max={subtotal}
                value={discount || ''}
                onChange={e => handleDiscountChange(e.target.value)}
                className="flex-1 px-3 py-2 text-sm focus:outline-none placeholder-gray-400"
                placeholder="0.00" />
            </div>
            {form.errors.discount_amount && <p className="text-red-500 text-xs mt-1">{form.errors.discount_amount}</p>}
          </div>

          {/* Discount reason */}
          {discount > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Reason</label>
              <input type="text"
                value={form.data.discount_reason}
                onChange={e => form.setData('discount_reason', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                placeholder="e.g., Senior citizen discount" />
              {form.errors.discount_reason && <p className="text-red-500 text-xs mt-1">{form.errors.discount_reason}</p>}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center py-3 px-4 bg-blue-50 rounded-xl">
            <span className="text-sm font-semibold text-gray-700">Total Amount</span>
            <span className="text-lg font-bold text-blue-600">₱{totalAfter.toFixed(2)}</span>
          </div>

          {form.errors.appointment_id && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <p className="text-sm text-red-600">{form.errors.appointment_id}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={form.processing}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg transition-colors">
              {form.processing ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InvoiceModal