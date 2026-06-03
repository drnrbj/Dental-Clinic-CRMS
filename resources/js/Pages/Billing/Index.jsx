import { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import InvoiceModal from '@/Components/Billing/InvoiceModal'
import PaymentModal from '@/Components/Billing/PaymentModal'
import { can } from '@/Utils/can'
import EmptyState, { Icons } from '@/Components/EmptyState'
import { SubmitButton } from '@/Components/Spinner'

function PaymentStatusBadge({ status }) {
  const map = { paid: 'bg-green-50 text-green-700', partial: 'bg-yellow-50 text-yellow-700', unpaid: 'bg-red-50 text-red-700' }
  const labels = { paid: 'Paid', partial: 'Partial', unpaid: 'Unpaid' }
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function Pagination({ links }) {
  if (!links || links.length <= 3) return null
  return (
    <div className="flex items-center justify-center gap-1 px-5 py-3 border-t border-gray-100">
      {links.map((link, i) => (
        <Link key={i} href={link.url ?? '#'} preserveScroll
          className={`px-3 py-1.5 text-xs rounded-md transition-colors ${!link.url ? 'text-gray-300 pointer-events-none' : ''} ${link.active ? 'bg-blue-600 text-white font-medium' : link.url ? 'text-gray-600 hover:bg-gray-100' : ''}`}
          dangerouslySetInnerHTML={{ __html: link.label }} />
      ))}
    </div>
  )
}

export default function BillingIndex() {
  const { pendingInvoices, invoices, flash, auth } = usePage().props
  const user = auth.user
  const [invoiceModal, setInvoiceModal]           = useState(false)
  const [paymentModal, setPaymentModal]           = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedInvoice, setSelectedInvoice]     = useState(null)
  const [flashDismissed, setFlashDismissed]       = useState(false)

  return (
    <AppLayout title="Billing">
      {!flashDismissed && flash?.success && (
        <div className="flex items-center justify-between bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3 mb-4">
          <span className="text-sm">{flash.success}</span>
          <button onClick={() => setFlashDismissed(true)} className="text-green-500 hover:text-green-700 ml-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Billing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage invoices and payment collection</p>
        </div>
      </div>

      {/* Needs Invoice */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          Needs Invoice
          {pendingInvoices.length > 0 && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium normal-case">{pendingInvoices.length}</span>}
        </h2>
        {pendingInvoices.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <EmptyState
              icon={<Icons.Check />}
              title="All caught up"
              description="Every completed appointment has been invoiced."
            />
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Patient</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Dentist</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Procedure</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Cost</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingInvoices.map(appt => (
                    <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                        <Link href={`/patients/${appt.patient_id}`} className="hover:text-blue-600 transition-colors">{appt.patient_name}</Link>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap hidden md:table-cell">{appt.date}</td>
                      <td className="px-4 py-3.5 text-gray-600 hidden lg:table-cell">{appt.dentist_name}</td>
                      <td className="px-4 py-3.5 hidden lg:table-cell"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{appt.procedure}</span></td>
                      <td className="px-4 py-3.5 text-right font-semibold text-blue-600">{appt.cost_display}</td>
                      <td className="px-4 py-3.5">
                        {can(user, 'billing.createInvoice') && (
                          <button onClick={() => { setSelectedAppointment(appt); setInvoiceModal(true) }}
                            className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            Create Invoice
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Invoices</h2>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">Invoice #</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Patient</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Total</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Paid</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Balance</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.data.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState
                        icon={<Icons.Receipt />}
                        title="No invoices yet"
                        description="Create an invoice from a completed appointment above."
                      />
                    </td>
                  </tr>
                ) : invoices.data.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-600 whitespace-nowrap">{inv.invoice_number}</td>
                    <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      <Link href={`/patients/${inv.patient_id}`} className="hover:text-blue-600 transition-colors">{inv.patient_name}</Link>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap hidden md:table-cell">{inv.date}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-gray-800 whitespace-nowrap">{inv.total_display}</td>
                    <td className="px-4 py-3.5 text-right text-green-700 whitespace-nowrap hidden sm:table-cell">{inv.paid_display}</td>
                    <td className="px-4 py-3.5 text-right font-semibold whitespace-nowrap hidden sm:table-cell" style={{ color: inv.balance > 0 ? '#dc2626' : '#16a34a' }}>{inv.balance_display}</td>
                    <td className="px-4 py-3.5"><PaymentStatusBadge status={inv.payment_status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {inv.payment_status !== 'paid' && can(user, 'billing.recordPayment') && (
                          <button onClick={() => { setSelectedInvoice(inv); setPaymentModal(true) }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                            + Payment
                          </button>
                        )}
                        <Link href={`/billing/invoices/${inv.id}/receipt`} className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">Receipt</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination links={invoices.links} />
        </div>
      </div>

      {invoiceModal && selectedAppointment && (
        <InvoiceModal open={invoiceModal} onClose={() => { setInvoiceModal(false); setSelectedAppointment(null) }} appointment={selectedAppointment} />
      )}
      {paymentModal && selectedInvoice && (
        <PaymentModal open={paymentModal} onClose={() => { setPaymentModal(false); setSelectedInvoice(null) }} invoice={selectedInvoice} />
      )}
    </AppLayout>
  )
}